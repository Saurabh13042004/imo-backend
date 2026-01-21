import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  Eye,
  EyeOff,
  FileUp,
  Loader,
} from 'lucide-react';
import axios from 'axios';
import BlogEditor from '@/components/admin/BlogEditor';

interface Blog {
  id: string;
  title: string;
  excerpt?: string;
  category?: string;
  featured_image?: string;
  read_time?: number;
  published: boolean;
  created_at: string;
  published_at?: string;
  content?: string;
}

const BlogManagement = () => {
  const { accessToken } = useAuthContext();
  
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  // Create axios instance with auth header
  const axiosInstance = useMemo(() => {
    return axios.create({
      baseURL: '/api/v1',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }, [accessToken]);

  // Fetch blogs
  useEffect(() => {
    fetchBlogs();
  }, [axiosInstance]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/blogs/admin/list/all', {
        params: { limit: 100 }
      });
      setBlogs(response.data.blogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog: Blog) => {
    setSelectedBlog(blog);
    setShowEditor(true);
  };

  const handleDelete = async (blogId: string) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      setDeleting(blogId);
      await axiosInstance.delete(`/blogs/${blogId}`);
      setBlogs(blogs.filter(b => b.id !== blogId));
    } catch (error) {
      console.error('Error deleting blog:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleEditorClose = () => {
    setShowEditor(false);
    setSelectedBlog(null);
    fetchBlogs();
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showEditor) {
    return <BlogEditor blog={selectedBlog} onClose={handleEditorClose} />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
            <p className="text-muted-foreground mt-2">
              Create, edit, and manage your blog posts
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => {
              setSelectedBlog(null);
              setShowEditor(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Blog Post
          </Button>
        </div>

        {/* Search */}
        <Input
          placeholder="Search blogs by title or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Blogs</p>
          <p className="text-2xl font-bold">{blogs.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Published</p>
          <p className="text-2xl font-bold text-green-600">
            {blogs.filter(b => b.published).length}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Drafts</p>
          <p className="text-2xl font-bold text-yellow-600">
            {blogs.filter(b => !b.published).length}
          </p>
        </div>
      </motion.div>

      {/* Blog List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border rounded-lg overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No blogs found matching your search.' : 'No blogs yet. Create your first blog post!'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => {
                  setSelectedBlog(null);
                  setShowEditor(true);
                }}
              >
                Create First Blog
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlogs.map((blog) => (
                  <motion.tr
                    key={blog.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {blog.featured_image && (
                          <img
                            src={blog.featured_image}
                            alt={blog.title}
                            className="h-10 w-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium line-clamp-1">{blog.title}</p>
                          {blog.read_time && (
                            <p className="text-xs text-muted-foreground">
                              {blog.read_time} min read
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {blog.category && (
                        <Badge variant="outline">{blog.category}</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {blog.published ? (
                          <>
                            <Eye className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-600">
                              Published
                            </span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-600">
                              Draft
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground">
                        {new Date(blog.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(blog)}
                          className="gap-1"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(blog.id)}
                          disabled={deleting === blog.id}
                          className="gap-1 text-destructive hover:text-destructive"
                        >
                          {deleting === blog.id ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BlogManagement;
