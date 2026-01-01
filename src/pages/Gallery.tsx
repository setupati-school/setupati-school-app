import React, { useState } from 'react';
import { LandingPageNavigation } from '@/components/ui/LandingPageNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User, Award, BookOpen, Users, PartyPopper, Heart, HelpCircle, Image as ImageIcon } from 'lucide-react';
import { Footer } from '@/components/Layout';
import { usePublicEventBlogs } from '@/hooks/useEventBlogs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EventCategory } from '@/types/schoolStoreType';

const categoryIcons: Record<EventCategory, React.ReactNode> = {
  Sports: <Award className="h-5 w-5" />,
  Academic: <BookOpen className="h-5 w-5" />,
  Cultural: <PartyPopper className="h-5 w-5" />,
  Ceremony: <Award className="h-5 w-5" />,
  Community: <Heart className="h-5 w-5" />,
  Other: <HelpCircle className="h-5 w-5" />
};

const categories: (EventCategory | 'All')[] = [
  'All',
  'Academic',
  'Sports',
  'Cultural',
  'Ceremony',
  'Community',
  'Other'
];

export const Gallery: React.FC = () => {
  const { blogs, isLoading, error } = usePublicEventBlogs();
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'All'>('All');
  const [expandedBlog, setExpandedBlog] = useState<string | null>(null);

  const filteredBlogs =
    selectedCategory === 'All'
      ? blogs
      : blogs.filter((blog) => blog.category === selectedCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <LandingPageNavigation />

      {/* Header */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            School Gallery
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Capturing moments of excellence, growth, and joy in our vibrant
            school community
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="px-4 mb-8">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground shadow-medium'
                    : 'bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground border border-border'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="px-4 pb-16">
        <div className="container mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Unable to load gallery. Please try again later.</p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No events yet</h3>
              <p className="text-muted-foreground">
                {selectedCategory === 'All'
                  ? 'Check back soon for updates on school events!'
                  : `No ${selectedCategory} events found. Try selecting a different category.`}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog) => (
                <Card
                  key={blog.id}
                  className="hover:shadow-medium transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => setExpandedBlog(expandedBlog === blog.id ? null : blog.id)}
                >
                  <div className="h-48 bg-gradient-secondary relative overflow-hidden">
                    {blog.images && blog.images.length > 0 ? (
                      <img
                        src={blog.images[0]}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/40" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-6xl text-primary-foreground/30">
                            {categoryIcons[blog.category]}
                          </div>
                        </div>
                      </>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-card/90 text-card-foreground rounded-full text-xs font-medium">
                        {blog.category}
                      </span>
                    </div>
                    {blog.images && blog.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        +{blog.images.length - 1} photos
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg text-card-foreground mb-2 group-hover:text-primary transition-colors">
                      {blog.title}
                    </h3>
                    <p className={`text-muted-foreground text-sm mb-3 ${expandedBlog === blog.id ? '' : 'line-clamp-2'}`}>
                      {blog.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(blog.event_date)}
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {blog.author_name}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
