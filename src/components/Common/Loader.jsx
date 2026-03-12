import React from 'react';
import Container from '../layout/Container';

function Loader({ message = "Loading your cart..." }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Container>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default Loader;