/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback, useRef } from "react";
import AnimatedList from "../components/history/AnimatedList";
import { matchHistory } from "../api/api";
import { Clock, Swords, Trophy, Skull, Calendar, Loader2 } from "lucide-react";

const History = () => {
  const [matches, setMatches] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loaderRef = useRef(null);

  const fetchMatches = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await matchHistory(page, limit);

      if (res.success) {
        setMatches((prev) => [...prev, ...res.data.matches]);
        setTotalMatches(res.data.totalMatches);
        
        // Check if we have more matches to load
        if (page * limit >= res.data.totalMatches) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Failed to fetch matches:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, loading, hasMore]);

  // fetch data whenever page changes
  useEffect(() => {
    fetchMatches();
  }, [page]);

  // infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [matches, hasMore, loading]);

  // Format match status with text representation
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'win':
        return '🏆 ';
      case 'loss':
        return '💀 ';
      default:
        return '⚔️ ';
    }
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Format match data for AnimatedList (as strings)
  const formatMatchData = (match) => {
    const statusIcon = getStatusIcon(match.status);
    const formattedDate = formatDate(match.createdAt);
    const shortMatchId = match.commonMatchId;
    
    return `${statusIcon}Match #${shortMatchId} • ${match.status.toUpperCase()} • ${formattedDate}`;
  };

  return (
    <div className="flex w-full min-h-screen pt-30 z-10 relative px-4 pb-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Match History</h1>
          <p className="text-gray-400 flex items-center justify-center">
            <Calendar className="w-4 h-4 mr-2" />
            {totalMatches} matches recorded
          </p>
        </div>

        {matches.length > 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <AnimatedList
              items={matches.map(formatMatchData)}
              onItemSelect={(item, index) => console.log(item, index)}
              showGradients={true}
              enableArrowNavigation={true}
              displayScrollbar={true}
              className="w-full"
              itemClassName="border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors duration-200 px-4 py-3"
            />

            <div ref={loaderRef} className="text-center py-6">
              {loading ? (
                <div className="flex items-center justify-center text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading more matches...
                </div>
              ) : hasMore ? (
                <p className="text-gray-400">Scroll to load more matches</p>
              ) : (
                <p className="text-gray-500">No more matches to load</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Swords className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No match history found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;