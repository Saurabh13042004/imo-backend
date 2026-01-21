import { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  Save,
  Loader,
  Check,
  X,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Video,
  Trash2,
  Palette,
} from 'lucide-react';
import axios from 'axios';

interface Blog {
  id?: string;
  title: string;
  excerpt?: string;
  content?: string;
  category?: string;
  read_time?: number;
  tags?: string[];
  published: boolean;
  featured_image?: string;
  created_at?: string;
}

interface BlogEditorProps {
  blog?: Blog | null;
  onClose: () => void;
}

const BlogEditor = ({ blog, onClose }: BlogEditorProps) => {
  const { accessToken, user } = useAuthContext();
  
  const [formData, setFormData] = useState<Blog>(
    blog || {
      title: '',
      excerpt: '',
      content: '',
      category: 'Blog',
      read_time: 5,
      tags: [],
      published: false,
      featured_image: '',
    }
  );

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);

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

  // Initialize Tiptap editor with enhanced extensions
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        paragraph: {
          HTMLAttributes: {
            class: 'mb-0',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-5',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-5',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'mb-0',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-primary pl-4 italic my-4',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-muted p-3 rounded overflow-x-auto',
          },
        },
        hardBreak: false,
      }),
      Link.configure({
        openOnClick: false,
      }),
      TextStyle,
      Color,
      Image.configure({
        allowBase64: true,
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
    ],
    content: blog?.content || '<p>Start typing...</p>',
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    const htmlContent = editor?.getHTML() || '';
    if (!htmlContent.trim() || htmlContent === '<p></p>') {
      newErrors.content = 'Content is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    try {
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        editor.chain().focus().setImage({ src: imageUrl }).run();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error adding image:', error);
      alert('Failed to add image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddYoutubeVideo = () => {
    if (!youtubeUrl.trim() || !editor) return;
    
    // Insert YouTube embed as an iframe using HTML
    const youtubeEmbed = `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
      <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
        src="${youtubeUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}" 
        frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen></iframe>
    </div>`;
    
    editor.chain().focus().insertContent(youtubeEmbed).run();
    setYoutubeUrl('');
    setShowYoutubeInput(false);
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    try {
      setUploadingImage(true);
      const formDataImg = new FormData();
      formDataImg.append('file', file);

      // Create a temporary blog or use existing blog ID
      let blogId = blog?.id;
      if (!blogId) {
        // Create a temporary blog to get an ID for uploads
        const tempBlog = await axiosInstance.post('/blogs/', {
          title: 'Temp',
          content: '<p>temp</p>',
          published: false,
        });
        blogId = tempBlog.data.id;
      }

      const response = await axiosInstance.post(`/blogs/${blogId}/upload`, formDataImg, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Use CloudFront URL from response
      const cloudFrontUrl = response.data.cloudfront_url || response.data.s3_url;
      setFormData(prev => ({
        ...prev,
        featured_image: cloudFrontUrl,
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const content = editor?.getHTML() || '';

      const payload = {
        title: formData.title,
        excerpt: formData.excerpt,
        content,
        category: formData.category,
        read_time: formData.read_time ? parseInt(String(formData.read_time)) : null,
        tags: formData.tags,
        published: formData.published,
        featured_image: formData.featured_image,
      };

      if (blog?.id) {
        // Update existing blog
        await axiosInstance.put(`/blogs/${blog.id}`, payload);
      } else {
        // Create new blog
        await axiosInstance.post('/blogs/', payload);
      }

      alert(blog?.id ? 'Blog updated successfully!' : 'Blog created successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag),
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">
              {blog ? 'Edit Blog' : 'Create New Blog'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setFormData(prev => ({ ...prev, published: !prev.published }))}
            >
              {formData.published ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Published
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Draft
                </>
              )}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2"
            >
              {saving ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Blog
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Enter blog title..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </motion.div>

            {/* Excerpt */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium">Excerpt (optional)</label>
              <Textarea
                placeholder="Brief summary of your blog post..."
                value={formData.excerpt || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={2}
              />
            </motion.div>

            {/* Featured Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium">Featured Image</label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFeaturedImageUpload}
                  disabled={uploadingImage}
                />
                {uploadingImage && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader className="h-4 w-4 animate-spin" />
                    Uploading...
                  </div>
                )}
              </div>
              {formData.featured_image && (
                <img
                  src={formData.featured_image}
                  alt="Featured"
                  className="h-40 w-full object-cover rounded-lg border"
                />
              )}
            </motion.div>

            {/* Rich Text Editor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium">Content</label>
              <div className="border rounded-lg overflow-hidden bg-background">
                {/* Toolbar - Text Formatting */}
                <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={editor?.isActive('bold') ? 'default' : 'ghost'}
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      title="Bold (Ctrl+B)"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={editor?.isActive('italic') ? 'default' : 'ghost'}
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                      title="Italic (Ctrl+I)"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={editor?.isActive('strike') ? 'default' : 'ghost'}
                      onClick={() => editor?.chain().focus().toggleStrike().run()}
                      title="Strikethrough"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="w-px bg-border mx-1" />

                  {/* Headings */}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={editor?.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                      className="text-xs font-bold"
                      title="Heading 1"
                    >
                      H1
                    </Button>
                    <Button
                      size="sm"
                      variant={editor?.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                      className="text-xs font-bold"
                      title="Heading 2"
                    >
                      H2
                    </Button>
                    <Button
                      size="sm"
                      variant={editor?.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                      className="text-xs font-bold"
                      title="Heading 3"
                    >
                      H3
                    </Button>
                  </div>

                  <div className="w-px bg-border mx-1" />

                  {/* Lists & Blocks */}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={editor?.isActive('bulletList') ? 'default' : 'ghost'}
                      onClick={() => editor?.chain().focus().toggleBulletList().run()}
                      title="Bullet List"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={editor?.isActive('orderedList') ? 'default' : 'ghost'}
                      onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                      title="Numbered List"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={editor?.isActive('blockquote') ? 'default' : 'ghost'}
                      onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                      title="Blockquote"
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={editor?.isActive('codeBlock') ? 'default' : 'ghost'}
                      onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                      title="Code Block"
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="w-px bg-border mx-1" />

                  {/* Media & Colors */}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploadingImage}
                      title="Insert Image"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAddImage}
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      variant={showYoutubeInput ? 'default' : 'ghost'}
                      onClick={() => setShowYoutubeInput(!showYoutubeInput)}
                      title="Add YouTube Video"
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const color = prompt('Enter color (hex or name):');
                        if (color) {
                          editor?.chain().focus().setColor(color).run();
                        }
                      }}
                      title="Text Color"
                    >
                      <Palette className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="w-px bg-border mx-1" />

                  {/* History */}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => editor?.chain().focus().undo().run()}
                      disabled={!editor?.can().undo()}
                      title="Undo"
                    >
                      <Undo2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => editor?.chain().focus().redo().run()}
                      disabled={!editor?.can().redo()}
                      title="Redo"
                    >
                      <Redo2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* YouTube URL Input */}
                {showYoutubeInput && (
                  <div className="flex gap-2 p-3 bg-muted/30 border-b">
                    <Input
                      placeholder="Paste YouTube URL (e.g., https://youtube.com/watch?v=...)"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddYoutubeVideo()}
                    />
                    <Button size="sm" onClick={handleAddYoutubeVideo}>
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowYoutubeInput(false);
                        setYoutubeUrl('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {/* Editor */}
                <div className="p-4 min-h-[400px] bg-background border rounded-md [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto [&_code]:bg-muted [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-sm [&_.ProseMirror]:outline-none">
                  <EditorContent editor={editor} />
                </div>
              </div>
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content}</p>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Category */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-card border rounded-lg p-4 space-y-3"
            >
              <h3 className="font-semibold">Blog Settings</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={formData.category || 'Blog'}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm bg-background"
                >
                  <option>Blog</option>
                  <option>Case Studies</option>
                  <option>News</option>
                  <option>Videos</option>
                  <option>Whitepapers</option>
                </select>
              </div>

              {/* Read Time */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Read Time (minutes)</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.read_time || 5}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    read_time: parseInt(e.target.value) || 5,
                  }))}
                />
              </div>
            </motion.div>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border rounded-lg p-4 space-y-3"
            >
              <h3 className="font-semibold">Tags</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addTag}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => removeTag(tag)}
                  >
                    {tag}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-card border rounded-lg p-4 space-y-3"
            >
              <h3 className="font-semibold text-sm">Info</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  {formData.published ? 'Published' : 'Draft'}
                </p>
                {blog?.created_at && (
                  <p>
                    <span className="font-medium">Created:</span>{' '}
                    {new Date(blog.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BlogEditor;
