'use client';

import { motion } from 'framer-motion';
import { Project } from '@/lib/types';

interface AICapabilitiesProps {
  aiCapabilities?: Project['aiCapabilities'];
  businessImpact?: Project['businessImpact'];
  technicalDetails?: Project['technicalDetails'];
  variant?: 'default' | 'detailed';
}

const capabilityIcons: Record<string, string> = {
  'computer-vision': '👁️',
  'nlp': '🗣️',
  'machine-learning': '🤖',
  'deep-learning': '🧠',
  'automation': '⚙️',
  'prediction': '🔮',
  'recommendation': '🎯',
  'optimization': '⚡'
};

const capabilityColors: Record<string, string> = {
  'computer-vision': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800',
  'nlp': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800',
  'machine-learning': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800',
  'deep-learning': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800',
  'automation': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-800',
  'prediction': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 border-pink-200 dark:border-pink-800',
  'recommendation': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
  'optimization': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200 border-cyan-200 dark:border-cyan-800'
};

export function AICapabilities({ 
  aiCapabilities, 
  businessImpact, 
  technicalDetails,
  variant = 'default' 
}: AICapabilitiesProps) {
  if (!aiCapabilities && !businessImpact && !technicalDetails) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 25
      }
    }
  };

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-gray-900 dark:text-white">
        AI Implementation Details
      </h4>

      {/* AI Capabilities */}
      {aiCapabilities && aiCapabilities.length > 0 && (
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            AI Capabilities
          </h5>
          
          <div className="grid gap-4 md:grid-cols-2">
            {aiCapabilities.map((capability, index) => (
              <motion.div
                key={index}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start gap-4">
                  <motion.div 
                    className="text-3xl p-2 bg-white dark:bg-gray-700 rounded-full shadow-sm"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    {capabilityIcons[capability.type] || '🤖'}
                  </motion.div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`
                        px-3 py-1.5 text-xs font-medium rounded-full border
                        ${capabilityColors[capability.type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600'}
                      `}>
                        {capability.type.replace('-', ' ').toUpperCase()}
                      </span>
                      
                      {capability.accuracy && (
                        <div className="flex items-center gap-1">
                          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${capability.accuracy}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                            />
                          </div>
                          <span className="text-sm font-bold text-green-600 dark:text-green-400">
                            {capability.accuracy}%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                      {capability.description}
                    </p>
                    
                    {variant === 'detailed' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {capability.modelType && (
                          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Model:</span>
                            <div className="mt-1">{capability.modelType}</div>
                          </div>
                        )}
                        {capability.trainingData && (
                          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Training Data:</span>
                            <div className="mt-1">{capability.trainingData}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Business Impact */}
      {businessImpact && (
        <motion.div
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Business Impact
          </h5>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {businessImpact.roi && (
              <motion.div
                className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                variants={itemVariants}
              >
                <div className="text-lg font-bold text-green-700 dark:text-green-300">
                  {businessImpact.roi}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  ROI
                </div>
              </motion.div>
            )}
            
            {businessImpact.costSavings && (
              <motion.div
                className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                variants={itemVariants}
              >
                <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                  {businessImpact.costSavings}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  Cost Savings
                </div>
              </motion.div>
            )}
            
            {businessImpact.timeReduction && (
              <motion.div
                className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                variants={itemVariants}
              >
                <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                  {businessImpact.timeReduction}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">
                  Time Reduction
                </div>
              </motion.div>
            )}
            
            {businessImpact.userGrowth && (
              <motion.div
                className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                variants={itemVariants}
              >
                <div className="text-lg font-bold text-orange-700 dark:text-orange-300">
                  {businessImpact.userGrowth}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">
                  User Growth
                </div>
              </motion.div>
            )}
            
            {businessImpact.revenueIncrease && (
              <motion.div
                className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800"
                variants={itemVariants}
              >
                <div className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                  {businessImpact.revenueIncrease}
                </div>
                <div className="text-xs text-indigo-600 dark:text-indigo-400">
                  Revenue Increase
                </div>
              </motion.div>
            )}
            
            {businessImpact.productivityGain && (
              <motion.div
                className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800"
                variants={itemVariants}
              >
                <div className="text-lg font-bold text-teal-700 dark:text-teal-300">
                  {businessImpact.productivityGain}
                </div>
                <div className="text-xs text-teal-600 dark:text-teal-400">
                  Productivity Gain
                </div>
              </motion.div>
            )}
            
            {businessImpact.errorReduction && (
              <motion.div
                className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                variants={itemVariants}
              >
                <div className="text-lg font-bold text-red-700 dark:text-red-300">
                  {businessImpact.errorReduction}
                </div>
                <div className="text-xs text-red-600 dark:text-red-400">
                  Error Reduction
                </div>
              </motion.div>
            )}
            
            {businessImpact.customerSatisfaction && (
              <motion.div
                className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                variants={itemVariants}
              >
                <div className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                  {businessImpact.customerSatisfaction}
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400">
                  Customer Satisfaction
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Technical Details */}
      {technicalDetails && variant === 'detailed' && (
        <motion.div
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Technical Implementation
          </h5>
          
          <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {technicalDetails.architecture && (
                <motion.div 
                  className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                  variants={itemVariants}
                >
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                    <span>🏗️</span>
                    Architecture
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {technicalDetails.architecture}
                  </div>
                </motion.div>
              )}
              
              {technicalDetails.deployment && (
                <motion.div 
                  className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                  variants={itemVariants}
                >
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                    <span>🚀</span>
                    Deployment
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {technicalDetails.deployment}
                  </div>
                </motion.div>
              )}
              
              {technicalDetails.scalability && (
                <motion.div 
                  className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                  variants={itemVariants}
                >
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                    <span>📈</span>
                    Scalability
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {technicalDetails.scalability}
                  </div>
                </motion.div>
              )}
              
              {technicalDetails.performance && (
                <motion.div 
                  className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                  variants={itemVariants}
                >
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                    <span>⚡</span>
                    Performance
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {technicalDetails.performance}
                  </div>
                </motion.div>
              )}
              
              {technicalDetails.dataProcessing && (
                <motion.div 
                  className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                  variants={itemVariants}
                >
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                    <span>🔄</span>
                    Data Processing
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {technicalDetails.dataProcessing}
                  </div>
                </motion.div>
              )}
              
              {technicalDetails.security && (
                <motion.div 
                  className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                  variants={itemVariants}
                >
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                    <span>🔒</span>
                    Security
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {technicalDetails.security}
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* API Endpoints */}
            {technicalDetails.apiEndpoints && technicalDetails.apiEndpoints.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  API Endpoints
                </div>
                <div className="flex flex-wrap gap-2">
                  {technicalDetails.apiEndpoints.map((endpoint, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded font-mono"
                    >
                      {endpoint}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Databases */}
            {technicalDetails.databases && technicalDetails.databases.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Databases
                </div>
                <div className="flex flex-wrap gap-2">
                  {technicalDetails.databases.map((db, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded"
                    >
                      {db}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Cloud Services */}
            {technicalDetails.cloudServices && technicalDetails.cloudServices.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Cloud Services
                </div>
                <div className="flex flex-wrap gap-2">
                  {technicalDetails.cloudServices.map((service, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}