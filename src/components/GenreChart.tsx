
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GenreChartProps {
  genreStats: Record<string, { count: number; avgRating: number }>;
}

export const GenreChart = ({ genreStats }: GenreChartProps) => {
  const chartData = Object.entries(genreStats).map(([genre, stats]) => ({
    genre: genre.length > 8 ? genre.substring(0, 8) + '...' : genre,
    fullGenre: genre,
    avgRating: stats.avgRating,
    count: stats.count
  })).sort((a, b) => b.avgRating - a.avgRating);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Average Rating by Genre</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="genre" 
              angle={-45}
              textAnchor="end"
              height={100}
              fontSize={12}
            />
            <YAxis 
              domain={[0, 10]}
              tickFormatter={(value) => `${value}/10`}
            />
            <Tooltip 
              formatter={(value, name) => [`${value}/10`, 'Average Rating']}
              labelFormatter={(label) => {
                const item = chartData.find(d => d.genre === label);
                return `${item?.fullGenre} (${item?.count} movies)`;
              }}
            />
            <Bar 
              dataKey="avgRating" 
              fill="#8884d8" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
