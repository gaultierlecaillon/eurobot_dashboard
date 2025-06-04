'use client';

import React from 'react';
import Link from 'next/link';

const Edition2025Page = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-100 mb-6">Eurobot 2025 Edition</h1>
      
      <div className="bg-slate-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold text-slate-100 mb-4">About the Competition</h2>
        <p className="text-slate-300 mb-4">
          The Eurobot 2025 competition is an international amateur robotics contest open to teams of young people, 
          organized in student projects or independent clubs. The competition challenges teams to build autonomous 
          robots that compete in matches on a specially designed playing field.
        </p>
        <p className="text-slate-300 mb-4">
          Each year, Eurobot presents a new theme and set of rules that guide the competition. 
          Teams must design, build, and program their robots to perform specific tasks related to the theme.
        </p>
      </div>

      <div className="bg-slate-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold text-slate-100 mb-4">2025 Rules and Regulations</h2>
        <p className="text-slate-300 mb-4">
          The official rules for the Eurobot 2025 competition have been published. These rules define the playing field, 
          game elements, scoring system, and all regulations that teams must follow.
        </p>
        <div className="mt-6">
          <Link 
            href="https://www.coupederobotique.fr/accueil/le-concours/reglement-2025/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <span className="mr-2">📄</span>
            View Official 2025 Rules
          </Link>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-slate-100 mb-4">Resources</h2>
        <p className="text-slate-300 mb-4">
          Visit the official Coupe de Robotique website for more information, resources, and updates about the 2025 competition:
        </p>
        <div className="mt-4">
          <Link 
            href="https://www.coupederobotique.fr/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <span className="mr-2">🌐</span>
            Official Website
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Edition2025Page;
