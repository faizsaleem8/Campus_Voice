import React from 'react';
import { MessageSquare, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white shadow-sm border-t border-gray-200">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center md:flex-row md:justify-between">
          <div className="mb-4 md:mb-0 flex items-center">
            <MessageSquare className="h-6 w-6 text-primary-600" />
            <span className="ml-2 text-lg font-semibold text-gray-900">Campus Voice</span>
          </div>
          
          <div className="flex flex-col items-center md:flex-row">
            <p className="text-gray-600 text-sm mb-2 md:mb-0 md:mr-4">
              © {currentYear} Campus Voice. All rights reserved.
            </p>
            <div className="flex items-center text-sm text-gray-600">
              <span>Made with</span>
              <Heart className="h-4 w-4 mx-1 text-error-500" />
              <span>for better campus communication</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;