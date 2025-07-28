'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Twitter, 
  Instagram,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import Image from 'next/image';

interface ContactItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  copyable?: boolean;
}

interface SocialLink {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: string;
}

export function ContactInfo() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const contactItems: ContactItem[] = [
    {
      icon: <Mail className="w-6 h-6" />,
      label: 'Email',
      value: 'chrisbelgrave@gmail.com',
      href: 'mailto:chrisbelgrave@gmail.com',
      copyable: true,
    },
    {
      icon: <Phone className="w-6 h-6" />,
      label: 'Phone',
      value: '+44 79123 60075',
      href: 'tel:+447912360075',
      copyable: true,
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      label: 'Location',
      value: 'London, United Kingdom',
      copyable: false,
    },
  ];

  const socialLinks: SocialLink[] = [
    {
      icon: <Linkedin className="w-6 h-6" />,
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/chrisbelgrave/',
      color: 'hover:bg-blue-600',
    },
    {
      icon: <Twitter className="w-6 h-6" />,
      label: 'Twitter',
      href: '#',
      color: 'hover:bg-sky-500',
    },
    {
      icon: <Instagram className="w-6 h-6" />,
      label: 'Instagram',
      href: '#',
      color: 'hover:bg-pink-600',
    },
  ];

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(label);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const socialVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
      },
    },
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Profile Section */}
      <motion.div variants={itemVariants} className="text-center lg:text-left">
        <div className="relative w-32 h-32 mx-auto lg:mx-0 mb-6">
          <Image
            src="/chris_profile.jpeg"
            alt="Christopher Belgrave"
            fill
            className="rounded-full object-cover shadow-lg"
            priority
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-500/20 to-accent-cyan/20" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Get In Touch</h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          I'm always interested in hearing about new projects and opportunities. 
          Whether you have a question about my work or want to discuss a potential 
          collaboration, feel free to reach out.
        </p>
      </motion.div>

      {/* Contact Items */}
      <motion.div variants={itemVariants} className="space-y-4">
        {contactItems.map((item, index) => (
          <motion.div
            key={item.label}
            variants={itemVariants}
            className="group relative"
          >
            <div className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-cyan rounded-lg flex items-center justify-center text-white mr-4">
                {item.icon}
              </div>
              
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-900 mb-1">{item.label}</h3>
                {item.href ? (
                  <a
                    href={item.href}
                    className="text-gray-600 hover:text-primary-500 transition-colors duration-200 flex items-center gap-1"
                  >
                    {item.value}
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </a>
                ) : (
                  <p className="text-gray-600">{item.value}</p>
                )}
              </div>

              {/* Copy Button */}
              {item.copyable && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleCopy(item.value, item.label)}
                  className="flex-shrink-0 w-10 h-10 bg-gray-100 hover:bg-primary-500 hover:text-white rounded-lg flex items-center justify-center transition-colors duration-200 opacity-0 group-hover:opacity-100"
                  title={`Copy ${item.label}`}
                >
                  {copiedItem === item.label ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </motion.button>
              )}
            </div>

            {/* Copy Success Message */}
            {copiedItem === item.label && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute -top-2 right-4 bg-green-500 text-white text-sm px-3 py-1 rounded-full shadow-lg"
              >
                Copied!
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Social Links */}
      <motion.div variants={itemVariants}>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Connect With Me</h3>
        <div className="flex gap-4">
          {socialLinks.map((social, index) => (
            <motion.a
              key={social.label}
              variants={socialVariants}
              whileHover="hover"
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-12 h-12 bg-gray-800 text-white rounded-lg flex items-center justify-center transition-colors duration-300 ${social.color}`}
              title={social.label}
            >
              {social.icon}
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-primary-50 to-accent-cyan/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Facts</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-500 mb-1">19+</div>
            <div className="text-sm text-gray-600">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-cyan mb-1">24h</div>
            <div className="text-sm text-gray-600">Response Time</div>
          </div>
        </div>
      </motion.div>

      {/* Availability Status */}
      <motion.div variants={itemVariants} className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <div>
            <p className="font-medium text-green-800">Available for New Projects</p>
            <p className="text-sm text-green-600">Currently accepting new collaborations</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}