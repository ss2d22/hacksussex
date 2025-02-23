"use client";

import { useState, useEffect, useCallback } from "react";
import { UserButton } from "@clerk/clerk-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TrendingUp, AlertTriangle } from "lucide-react";

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

  const fetchLeaderboardData = useCallback(async () => {
    const response = await fetch("http://localhost:8000/leaderboard");
    return await response.json();
  }, []);

  const fetchMisinformationTweets = useCallback(async () => {
    const response = await fetch("http://localhost:8000/llm_tweet_check");
    const data: MisinformationTweets = await response.json();
    return data.misinformation_tweets[0].split("\n").filter(Boolean);
  }, []);

  const fetchCategoryData = useCallback(async () => {
    const response = await fetch("http://localhost:8000/category-list");
    const data = await response.json();
    return data.categories;
  }, []);

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

  const fetchAllData = useCallback(async () => {
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
  }, [
    fetchLeaderboardData,
    fetchMisinformationTweets,
    fetchCategoryData,
    updateTweets,
  ]);

  useEffect(() => {
    fetchAllData();

    const intervalId = setInterval(() => {
      fetchMisinformationTweets().then(updateTweets);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchAllData, updateTweets, fetchMisinformationTweets]);

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

  const chartConfig = {
    value: {
      label: "Misinformation Score",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">
          Misinformation Dashboard
        </h1>
        <UserButton />
      </div>
      <Button
        onClick={fetchAllData}
        disabled={isLoading}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {isLoading ? "Updating..." : "Update All Data"}
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-primary">
              Top 10 Misinformation Topics
            </CardTitle>
            <CardDescription>Based on misinformation score</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer config={chartConfig}>
              <BarChart width={500} height={300} data={leaderboardChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--muted-foreground))"
                />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: "hsl(var(--accent))" }}
                />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              <span>live misinformation update</span>
            </div>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardFooter>
        </Card>
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-primary">
              Recent Misinformation Tweets
            </CardTitle>
            <CardDescription>Live updates every 5 seconds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Input
                type="text"
                placeholder="Filter keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="bg-input text-primary"
              />
              <div className="flex items-center space-x-2">
                <Switch
                  id="keyword-filter"
                  checked={isKeywordFilterEnabled}
                  onCheckedChange={setIsKeywordFilterEnabled}
                />
                <Label htmlFor="keyword-filter" className="text-primary">
                  Enable filter
                </Label>
              </div>
            </div>
            <ScrollArea className="h-[300px] w-full rounded-md border border-accent p-4">
              {displayedTweets.map((tweet, index) => (
                <div key={index}>
                  <p className="text-sm text-primary">{tweet}</p>
                  {index < displayedTweets.length - 1 && (
                    <Separator className="my-2 bg-accent" />
                  )}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            Showing {displayedTweets.length} of {MAX_TWEETS} tweets
          </CardFooter>
        </Card>
      </div>
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-primary">
            Categorized Misinformation Tweets
          </CardTitle>
          <CardDescription>Filter tweets by category</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px] mb-4 bg-input text-primary">
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
          <ScrollArea className="h-[400px] w-full rounded-md border border-accent p-4">
            {categoryData
              .filter(
                (category) =>
                  selectedCategory === "all" ||
                  category.hashtag === selectedCategory
              )
              .flatMap((category) =>
                category.misinformation_tweet.map((tweet, tweetIndex) => (
                  <div key={`${category.hashtag}-${tweetIndex}`}>
                    <p className="text-sm text-primary">
                      <span className="font-bold text-accent-foreground">
                        #{category.hashtag}
                      </span>{" "}
                      {tweet}
                    </p>
                    <Separator className="my-2 bg-accent" />
                  </div>
                ))
              )}
          </ScrollArea>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          {selectedCategory === "all"
            ? "Showing all categories"
            : `Showing tweets for #${selectedCategory}`}
        </CardFooter>
      </Card>
    </div>
  );
}
