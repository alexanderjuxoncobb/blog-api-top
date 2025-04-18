// client-admin/src/pages/DashboardPage.jsx
import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import StatCard from "../components/Dashboard/StatCard";
import PostsChart from "../components/Dashboard/PostsChart";
import RecentActivity from "../components/Dashboard/RecentActivity";
import { getDashboardStats, getPosts } from "../utils/api";

function DashboardPage() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalComments: 0,
    publishedPosts: 0,
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);

  // Helper functions defined outside of any loops for better performance
  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const formatDisplayDate = (date) => {
    const month = date.toLocaleString("default", { month: "short" });
    return `${month} ${date.getDate()}`;
  };

  // Process posts to generate chart data (optimized with single pass)
  const getLastSevenDaysData = (posts) => {
    // Create a map for faster lookups
    const postsByDate = {};
    const result = [];
    const today = new Date();

    // Initialize the date buckets for last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = formatDate(date);
      const displayDate = formatDisplayDate(date);

      postsByDate[dateString] = { published: 0, draft: 0 };
      result.push({
        name: displayDate,
        dateString,
        published: 0,
        draft: 0,
      });
    }

    // Count posts with a single pass
    if (posts && posts.length) {
      posts.forEach((post) => {
        if (!post.createdAt) return;

        const postDate = formatDate(new Date(post.createdAt));
        if (postsByDate[postDate]) {
          if (post.published) {
            postsByDate[postDate].published++;
          } else {
            postsByDate[postDate].draft++;
          }
        }
      });
    }

    // Update the result array with the counts
    result.forEach((item) => {
      const counts = postsByDate[item.dateString];
      if (counts) {
        item.published = counts.published;
        item.draft = counts.draft;
      }
      delete item.dateString; // Clean up the temporary property
    });

    return result;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Make API calls in parallel for better performance
        const [data, postsResponse] = await Promise.all([
          getDashboardStats(),
          getPosts(),
        ]);

        const allPosts = postsResponse.posts || [];

        // Set the stats from the response
        setStats({
          totalPosts: data.stats.totalPosts,
          totalUsers: data.stats.totalUsers,
          totalComments: data.stats.totalComments,
          publishedPosts: data.stats.publishedPosts,
        });

        // Process recent activity more efficiently
        const recentActivities = [
          // Process recent posts
          ...(data.recentActivity.posts || []).map((post) => ({
            type: post.published ? "post_updated" : "post_created",
            message: `${post.published ? "Post updated" : "New post created"}: "${post.title}"`,
            date: new Date(post.createdAt),
            link: `/posts/${post.id}`,
          })),

          // Process recent comments
          ...(data.recentActivity.comments || []).map((comment) => ({
            type: "comment_added",
            message: `New comment by ${comment.name} on "${comment.post.title}"`,
            date: new Date(comment.createdAt),
            link: `/posts/${comment.post.id}`,
          })),
        ];

        // Sort by date, newest first
        recentActivities.sort((a, b) => b.date - a.date);
        setActivities(recentActivities);

        // Generate chart data
        const chartDataArray = getLastSevenDaysData(allPosts);
        setChartData(chartDataArray);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Posts"
            value={stats.totalPosts}
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            }
          />
          <StatCard
            title="Published Posts"
            value={stats.publishedPosts}
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            }
            trend="up"
            trendValue={`${Math.round((stats.publishedPosts / stats.totalPosts) * 100)}% of total`}
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            }
          />
          <StatCard
            title="Total Comments"
            value={stats.totalComments}
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            }
          />
        </div>

        {/* Chart and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PostsChart data={chartData} />
          </div>
          <div className="lg:col-span-1">
            <RecentActivity activities={activities} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default DashboardPage;
