import { useState, useEffect } from "react";
import { UserButton } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

interface LeaderboardData {
  [key: string]: number;
}

interface MisinformationTweets {
  misinformation_tweets: string[];
}

export default function Home() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({});
  const [misinformationTweets, setMisinformationTweets] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [leaderboardResponse, tweetsResponse] = await Promise.all([
        fetch("http://localhost:8000/leaderboard"),
        fetch("http://localhost:8000/llm_tweet_check"),
      ]);

      const leaderboardData: LeaderboardData = await leaderboardResponse.json();
      const tweetsData: MisinformationTweets = await tweetsResponse.json();

      setLeaderboardData(leaderboardData);
      setMisinformationTweets(
        tweetsData.misinformation_tweets[0].split("\n").filter(Boolean)
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const leaderboardChartData = Object.entries(leaderboardData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Misinformation Dashboard</h1>
        <UserButton />
      </div>
      <Button onClick={fetchData} disabled={isLoading} className="mb-4">
        {isLoading ? "Updating..." : "Update Data"}
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              {misinformationTweets.map((tweet, index) => (
                <div key={index}>
                  <p className="text-sm">{tweet}</p>
                  {index < misinformationTweets.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
