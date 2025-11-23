import React from 'react';
import { LandingPageNavigation } from '@/components/ui/LandingPageNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Award, Users, BookOpen, Star, Calendar, Target } from 'lucide-react';
import { Footer } from '@/components/Layout/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      <LandingPageNavigation />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
            Welcome to Setupati School
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Empowering minds, shaping futures. Excellence in education for over
            two decades, nurturing tomorrow's leaders with innovative teaching
            methodologies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/login">
              <Button variant="login" size="lg">
                Student Portal
              </Button>
            </Link>
            <Link to="/gallery">
              <Button variant="outline" size="lg">
                View Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-card/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">
              About Setupati School
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Founded with a vision to provide quality education, we have been
              at the forefront of educational excellence, combining traditional
              values with modern teaching techniques.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-medium transition-all duration-300">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle>Expert Faculty</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our dedicated team of qualified educators brings years of
                  experience and passion to the classroom.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-medium transition-all duration-300">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle>Modern Curriculum</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Updated curriculum designed to meet contemporary educational
                  standards and future challenges.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-medium transition-all duration-300">
              <CardHeader>
                <Target className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle>Holistic Development</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Focus on overall personality development including academics,
                  sports, and extracurricular activities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Our Achievements
            </h2>
            <p className="text-lg text-muted-foreground">
              Celebrating excellence in education and student success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center bg-gradient-secondary text-secondary-foreground">
              <CardContent className="p-6">
                <Award className="h-8 w-8 mx-auto mb-2" />
                <div className="text-2xl font-bold mb-1">25+</div>
                <div className="text-sm">Years of Excellence</div>
              </CardContent>
            </Card>

            <Card className="text-center bg-gradient-primary text-primary-foreground">
              <CardContent className="p-6">
                <Star className="h-8 w-8 mx-auto mb-2" />
                <div className="text-2xl font-bold mb-1">98%</div>
                <div className="text-sm">Success Rate</div>
              </CardContent>
            </Card>

            <Card className="text-center bg-gradient-secondary text-secondary-foreground">
              <CardContent className="p-6">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <div className="text-2xl font-bold mb-1">5000+</div>
                <div className="text-sm">Alumni Network</div>
              </CardContent>
            </Card>

            <Card className="text-center bg-gradient-primary text-primary-foreground">
              <CardContent className="p-6">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <div className="text-2xl font-bold mb-1">50+</div>
                <div className="text-sm">Annual Events</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-card/50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Join Our Community
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience the difference of quality education. Login to access your
            portal or explore our gallery to see our vibrant school life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/login">
              <Button variant="login" size="lg">
                Access Portal
              </Button>
            </Link>
            <Link to="/gallery">
              <Button variant="outline" size="lg">
                Explore Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
