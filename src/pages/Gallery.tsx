import React from 'react';
import { LandingPageNavigation } from '@/components/ui/LandingPageNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Users, Award, BookOpen } from 'lucide-react';

const Gallery: React.FC = () => {
  const galleryItems = [
    {
      id: 1,
      title: 'Annual Sports Day 2024',
      description:
        'Students showcasing their athletic talents in various sports competitions',
      category: 'Sports',
      date: 'March 15, 2024',
      icon: <Award className="h-5 w-5" />
    },
    {
      id: 2,
      title: 'Science Exhibition',
      description:
        'Young minds presenting innovative science projects and experiments',
      category: 'Academic',
      date: 'February 28, 2024',
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      id: 3,
      title: 'Cultural Festival',
      description:
        'Celebrating diversity through dance, music, and cultural performances',
      category: 'Cultural',
      date: 'January 20, 2024',
      icon: <Users className="h-5 w-5" />
    },
    {
      id: 4,
      title: 'Graduation Ceremony 2024',
      description:
        'Honoring our graduating students and their academic achievements',
      category: 'Ceremony',
      date: 'April 10, 2024',
      icon: <Award className="h-5 w-5" />
    },
    {
      id: 5,
      title: 'Math Olympiad Victory',
      description: 'Our students excel in the regional mathematics competition',
      category: 'Academic',
      date: 'March 5, 2024',
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      id: 6,
      title: 'Community Service Day',
      description:
        'Students engaging in community outreach and social service activities',
      category: 'Community',
      date: 'February 14, 2024',
      icon: <Users className="h-5 w-5" />
    }
  ];

  const categories = [
    'All',
    'Academic',
    'Sports',
    'Cultural',
    'Ceremony',
    'Community'
  ];
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredItems =
    selectedCategory === 'All'
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedCategory);

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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="hover:shadow-medium transition-all duration-300 overflow-hidden group cursor-pointer"
              >
                <div className="h-48 bg-gradient-secondary relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl text-primary-foreground/30">
                      {item.icon}
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-card/90 text-card-foreground rounded-full text-xs font-medium">
                      {item.category}
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-card-foreground mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    {item.description}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {item.date}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <p className="text-sm">
            © 2024 Setupati School. All rights reserved. Empowering Education
            Through Technology.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Gallery;
