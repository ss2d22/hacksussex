import { useState, useEffect, useCallback } from "react";
import { UserButton } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeaderboardData {
  [key: string]: number;
}

interface MisinformationTweets {
  misinformation_tweets: string[];
}

interface CategoryData {
  hashtag: string;
  misinformation_tweet: string[];
}

const MAX_TWEETS = 100;

export default function Home() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({});
  const [misinformationTweets, setMisinformationTweets] = useState<string[]>(
    []
  );
  const [filteredTweets, setFilteredTweets] = useState<string[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [isKeywordFilterEnabled, setIsKeywordFilterEnabled] = useState(false);

  const fetchLeaderboardData = async () => {
    const response = await fetch("http://localhost:8000/leaderboard");
    return await response.json();
  };

  const fetchMisinformationTweets = async () => {
    const response = await fetch("http://localhost:8000/llm_tweet_check");
    const data: MisinformationTweets = await response.json();
    return data.misinformation_tweets[0].split("\n").filter(Boolean);
  };

  const fetchCategoryData = async () => {
    const response = await fetch("http://localhost:8000/category-list");
    const data = await response.json();
    return data.categories;
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [leaderboard, tweets, categories] = await Promise.all([
        fetchLeaderboardData(),
        fetchMisinformationTweets(),
        fetchCategoryData(),
      ]);

      setLeaderboardData(leaderboard);
      updateTweets(tweets);
      setCategoryData(categories);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setIsLoading(false);
  };

  const updateTweets = useCallback(
    (newTweets: string[]) => {
      setMisinformationTweets((prevTweets) => {
        const updatedTweets = [...newTweets, ...prevTweets];
        return updatedTweets.slice(0, MAX_TWEETS);
      });

      if (isKeywordFilterEnabled) {
        setFilteredTweets((prevFiltered) => {
          const newFilteredTweets = newTweets.filter((tweet) =>
            tweet.toLowerCase().includes(keyword.toLowerCase())
          );
          const updatedFiltered = [...newFilteredTweets, ...prevFiltered];
          return updatedFiltered.slice(0, MAX_TWEETS);
        });
      }
    },
    [isKeywordFilterEnabled, keyword]
  );

  useEffect(() => {
    fetchAllData();

    const intervalId = setInterval(() => {
      fetchMisinformationTweets().then(updateTweets);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [updateTweets]);

  useEffect(() => {
    if (isKeywordFilterEnabled) {
      setFilteredTweets(
        misinformationTweets
          .filter((tweet) =>
            tweet.toLowerCase().includes(keyword.toLowerCase())
          )
          .slice(0, MAX_TWEETS)
      );
    } else {
      setFilteredTweets([]);
    }
  }, [isKeywordFilterEnabled, keyword, misinformationTweets]);

  const leaderboardChartData = Object.entries(leaderboardData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  const displayedTweets = isKeywordFilterEnabled
    ? filteredTweets
    : misinformationTweets;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Misinformation Dashboard</h1>
        <UserButton />
      </div>
      <Button onClick={fetchAllData} disabled={isLoading} className="mb-4">
        {isLoading ? "Updating..." : "Update All Data"}
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Misinformation Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={leaderboardChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={70}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Misinformation Tweets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Input
                type="text"
                placeholder="Filter keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <div className="flex items-center space-x-2">
                <Switch
                  id="keyword-filter"
                  checked={isKeywordFilterEnabled}
                  onCheckedChange={setIsKeywordFilterEnabled}
                />
                <Label htmlFor="keyword-filter">Enable filter</Label>
              </div>
            </div>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              {displayedTweets.map((tweet, index) => (
                <div key={index}>
                  <p className="text-sm">{tweet}</p>
                  {index < displayedTweets.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Categorized Misinformation Tweets</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px] mb-4">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryData.map((category) => (
                <SelectItem key={category.hashtag} value={category.hashtag}>
                  {category.hashtag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            {categoryData
              .filter(
                (category) =>
                  selectedCategory === "all" ||
                  category.hashtag === selectedCategory
              )
              .flatMap((category) =>
                category.misinformation_tweet.map((tweet, tweetIndex) => (
                  <div key={`${category.hashtag}-${tweetIndex}`}>
                    <p className="text-sm">
                      <span className="font-bold text-primary">
                        #{category.hashtag}
                      </span>{" "}
                      {tweet}
                    </p>
                    <Separator className="my-2" />
                  </div>
                ))
              )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
