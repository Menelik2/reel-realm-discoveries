
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxMTc3ZGU0OGNkNDQ5NDNlNjAyNDAzMzdiYWM4MDg3NyIsIm5iZiI6MTY3MjEyMTIxOS40NzksInN1YiI6IjYzYWE4YjgzN2VmMzgxMDA4MjM4ODkyYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sf2ZTREEsHrFWMtvGfms47vqB-WSRtaTXsnD1wHypZc';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const Admin = () => {
  const [tmdbId, setTmdbId] = useState('');
  const [contentType, setContentType] = useState<'movie' | 'tv'>('movie');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully.');
    navigate('/');
  };

  const verifyAndAddContent = async () => {
    if (!tmdbId) {
        toast.error('Please enter a TMDB ID.');
        return;
    }
    setLoading(true);

    try {
        const verifyUrl = `${TMDB_BASE_URL}/${contentType}/${tmdbId}`;
        const response = await fetch(verifyUrl, {
            headers: {
                'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
                'Content-Type': 'application/json;charset=utf-8'
            }
        });

        if (!response.ok) {
            throw new Error(`Content with ID ${tmdbId} not found on TMDB.`);
        }
        await response.json();

        const { error } = await supabase
            .from('custom_content')
            .insert({ tmdb_id: parseInt(tmdbId), content_type: contentType });

        if (error) {
            if (error.code === '23505') { // unique_violation
                throw new Error('This content has already been added.');
            }
            throw error;
        }

        toast.success('Content added successfully!');
        setTmdbId('');

    } catch (err) {
        toast.error(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header searchQuery="" setSearchQuery={() => {}} isDarkMode={false} setIsDarkMode={() => {}} />
      <main className="flex-grow container mx-auto px-4 py-8 flex justify-center items-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>Add New Content</CardTitle>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
            <CardDescription>
              Enter the TMDB ID of a movie or TV series to add it to the custom list.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Select value={contentType} onValueChange={(value) => setContentType(value as 'movie' | 'tv')}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="movie">Movie</SelectItem>
                    <SelectItem value="tv">TV Series</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="text"
                  placeholder={`Enter ${contentType === 'movie' ? 'Movie' : 'TV Series'} TMDB ID`}
                  value={tmdbId}
                  onChange={(e) => setTmdbId(e.target.value.replace(/\D/g, ''))}
                  required
                  disabled={loading}
                />
              </div>
              <Button onClick={verifyAndAddContent} className="w-full" disabled={loading}>
                {loading ? 'Adding...' : 'Add Content'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
