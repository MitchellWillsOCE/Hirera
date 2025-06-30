"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BentoGrid, BentoGridItem } from "../components/ui/bento-grid";
import { ContainerScroll } from "../components/ui/container-scroll-animation";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Spotlight } from "../components/ui/spotlight";

import {
  IconArrowRight,
  IconClipboardCheck,
  IconChartInfographic,
  IconTargetArrow,
  IconFileText,
  IconBriefcase,
  IconBrandGithub,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconClipboardText,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="bg-white text-black min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <IconBriefcase className="h-6 w-6 text-blue-600" />
              <Link href="/" className="text-2xl font-bold text-black">
                Hirera
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/auth/signin">
                <button className="px-4 py-2 text-sm font-medium text-black bg-transparent rounded-md hover:bg-gray-100">
                  Login
                </button>
              </Link>
              <Link href="/auth/signup">
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen pt-24 text-center overflow-hidden">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="rgb(147 197 253)"
        />

        {/* Animated Blobs */}
        <motion.div
          animate={{
            y: [0, -20, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 opacity-30 -z-10"
        >
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#A7F3D0" d="M49.5,-59.6C62.3,-48.9,70,-32.8,74.2,-15.5C78.4,1.7,79.1,20.1,71.2,34.9C63.3,49.7,46.8,60.9,29.9,67.9C13,74.9,-4.3,77.7,-21.7,73.1C-39.1,68.5,-56.6,56.5,-67.2,40.1C-77.8,23.7,-81.5,3,-78.2,-15.8C-74.8,-34.5,-64.4,-51.4,-50.2,-61.8C-36,-72.2,-18,-76.1,-0.8,-75.2C16.4,-74.3,32.8,-68.4,49.5,-59.6Z" transform="translate(100 100)"></path>
          </svg>
        </motion.div>
        <motion.div
           animate={{
            y: [0, 25, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 opacity-30 -z-10"
        >
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#D1E9FF" d="M51.3,-52.5C64,-39.8,70,-20,68.4,-2.4C66.9,15.2,57.9,30.4,45.6,44.7C33.3,59,16.7,72.4,0.1,72.4C-16.4,72.4,-32.8,59.1,-46.8,44.9C-60.9,30.8,-72.5,15.4,-72.8,-0.3C-73.1,-16,-62.1,-32.1,-49,-45.3C-36,-58.5,-20.9,-68.8,-3.8,-67.1C13.3,-65.4,26.5,-51.7,51.3,-52.5Z" transform="translate(100 100)"></path>
            </svg>
        </motion.div>

        <div className="absolute inset-0 -z-20 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#D1E9FF,transparent)]"></div>
        </div>
        <div className="relative z-10 px-4 flex flex-col items-center">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-5xl sm:text-6xl md:text-8xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 py-4">
                Land Your Dream Job <br /> The Smarter Way
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6 max-w-2xl mx-auto text-lg text-gray-700">
                Hirera streamlines your job search with powerful tracking, AI-driven insights, and goal management tools.
            </motion.p>
            <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.4 }}
            >
                <Link href="/auth/signup">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="mt-8 px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 inline-flex items-center shadow-lg shadow-blue-500/20">
                        Get Started Free <IconArrowRight className="ml-2 h-5 w-5" />
                    </motion.button>
                </Link>
            </motion.div>
        </div>
      </section>

      {/* Trusted by Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 0.5 }}
                className="text-center text-sm font-semibold text-gray-500">
                Trusted by job seekers at companies like
            </motion.p>
            <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, amount: 0.8 }}
                 transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-center items-center flex-wrap gap-x-8 md:gap-x-12 mt-6 text-gray-400">
                <span className="font-semibold text-xl sm:text-2xl">Google</span>
                <span className="font-semibold text-xl sm:text-2xl">Meta</span>
                <span className="font-semibold text-xl sm:text-2xl">Amazon</span>
                <span className="font-semibold text-xl sm:text-2xl">Netflix</span>
                <span className="font-semibold text-xl sm:text-2xl">Microsoft</span>
            </motion.div>
        </div>
      </section>

      {/* How it works Section */}
        <section className="py-24 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-4xl font-bold text-center mb-2 text-black">
                    Get Started in 3 Easy Steps
                </h2>
                <p className="text-lg text-center text-gray-600 mb-16">
                    Start organizing your job search in minutes.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    {howItWorks.map((step, i) => (
                        <motion.div
                            key={i}
                             initial={{ opacity: 0, y: 50 }}
                             whileInView={{ opacity: 1, y: 0 }}
                             viewport={{ once: true, amount: 0.5 }}
                             transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="flex flex-col items-center">
                            <div className={`flex items-center justify-center h-20 w-20 rounded-full text-white border-4 border-white shadow-lg mb-6 ${step.color}`}>
                                <span className="text-3xl font-bold">{i+1}</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                            <p className="text-gray-600 px-4">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* Features Section */}
       <section className="py-24 bg-white">
          <h2 className="text-4xl font-bold text-center mb-2 text-black">
            A Feature for Every Step
          </h2>
          <p className="text-lg text-center text-gray-600 mb-16">
            Powerful tools to help you get hired faster.
          </p>
        <BentoGrid className="max-w-5xl mx-auto">
          {features.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              className={cn("[&>p:text-lg] dark:bg-zinc-900", item.className)}
              icon={item.icon}
            />
          ))}
        </BentoGrid>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-2 text-black">
            Loved by Job Seekers Worldwide
          </h2>
          <p className="text-lg text-center text-gray-600 mb-12">
            Our users land their dream jobs. Here's what they have to say.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col"
              >
                <p className="text-gray-800 text-base flex-grow">"{testimonial.quote}"</p>
                <p className="mt-6 font-bold text-gray-900">- {testimonial.author}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
       <div className="bg-white">
        <ContainerScroll
            titleComponent={
            <>
                <h1 className="text-4xl font-semibold text-black">
                Get in Touch with Us <br />
                <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-600">
                    We'd love to hear from you
                </span>
                </h1>
            </>
            }
        >
            <form className="max-w-xl w-full mx-auto p-8 md:p-12 rounded-2xl bg-white shadow-2xl border border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <Input id="firstName" placeholder="First Name" className="bg-gray-100 border-gray-200" />
                    <Input id="lastName" placeholder="Last Name" className="bg-gray-100 border-gray-200" />
                </div>
                <div className="mb-6">
                    <Input id="email" placeholder="Your Email Address" type="email" className="bg-gray-100 border-gray-200" />
                </div>
                <div className="mb-6">
                    <Textarea id="message" placeholder="Your message..." className="bg-gray-100 border-gray-200" rows={5} />
                </div>
                <div className="text-center">
                    <button type="submit" className="w-full px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        Send Message
                    </button>
                </div>
            </form>
        </ContainerScroll>
       </div>

      {/* Footer */}
      <footer className="py-16 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
            <div className="flex justify-center space-x-6 mb-8">
                <Link href="#" className="hover:text-black"><IconBrandTwitter /></Link>
                <Link href="#" className="hover:text-black"><IconBrandGithub /></Link>
                <Link href="#" className="hover:text-black"><IconBrandLinkedin /></Link>
            </div>
            <p>&copy; {new Date().getFullYear()} Hirera. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Centralized Application Tracking",
    description: "Manage all your job applications in one place. Never let an opportunity slip through the cracks.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-100 to-blue-200"></div>,
    className: "md:col-span-2",
    icon: <IconClipboardCheck className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "AI-Powered Job Insights",
    description: "Gain a competitive edge with analytics on your application history.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-teal-100 to-teal-200"></div>,
    className: "md:col-span-1",
    icon: <IconChartInfographic className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Strategic Goal Setting",
    description: "Set and track weekly or monthly goals for applications, interviews, and offers.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-violet-100 to-violet-200"></div>,
    className: "md:col-span-1",
    icon: <IconTargetArrow className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Seamless Document Management",
    description:
      "Keep your resumes, cover letters, and other documents organized and accessible.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-red-100 to-red-200"></div>,
    className: "md:col-span-2",
    icon: <IconFileText className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "LinkedIn Integration",
    description: "Import job applications directly from LinkedIn to streamline your workflow.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200"></div>,
    className: "md:col-span-1",
    icon: <IconBrandLinkedin className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Interview Prep Hub",
    description: "Track upcoming interviews, store notes, and access preparation resources.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-green-100 to-green-200"></div>,
    className: "md:col-span-2",
    icon: <IconClipboardText className="h-4 w-4 text-neutral-500" />,
  },
];

const testimonials = [
  {
    quote: "Hirera completely transformed my job search. I went from a chaotic spreadsheet to a streamlined system and landed my dream job in 3 weeks!",
    author: "Sarah J.",
    role: "Software Engineer",
  },
  {
    quote: "As a product manager, I love data. The analytics gave me incredible insights into where I should focus my efforts. Highly recommended!",
    author: "Michael B.",
    role: "Product Manager",
  },
  {
    quote: "I used to lose track of applications all the time. Hirera kept me organized and motivated. It's a must-have for any serious job seeker.",
    author: "Emily K.",
    role: "UX Designer",
  },
];

const howItWorks = [
    {
        title: "Create Your Account",
        description: "Sign up for free and set up your profile in just a few clicks.",
        color: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
        title: "Add Your Applications",
        description: "Easily add jobs you've applied for from any platform.",
        color: "bg-gradient-to-br from-teal-500 to-teal-600"
    },
    {
        title: "Track and Analyze",
        description: "Use our powerful dashboard and analytics to stay organized and get hired.",
        color: "bg-gradient-to-br from-violet-500 to-violet-600"
    }
]
