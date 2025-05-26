'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  CheckCircleIcon,
  CogIcon,
  TruckIcon,
  HomeIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid,
  CogIcon as CogIconSolid,
  TruckIcon as TruckIconSolid,
  HomeIcon as HomeIconSolid,
  XCircleIcon as XCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  ArrowUturnLeftIcon as ArrowUturnLeftIconSolid,
} from '@heroicons/react/24/solid';

interface OrderStatusTimelineProps {
  currentStatus: string;
  orderDate: string;
  estimatedDelivery?: string;
}

interface StatusStep {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  iconSolid: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

const statusSteps: StatusStep[] = [
  {
    id: 'PENDING',
    name: 'Order Placed',
    description: 'Your order has been placed and is awaiting payment',
    icon: ClockIcon,
    iconSolid: ClockIconSolid,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  {
    id: 'PAID',
    name: 'Payment Confirmed',
    description: 'Payment has been received and confirmed',
    icon: CheckCircleIcon,
    iconSolid: CheckCircleIconSolid,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    id: 'PROCESSING',
    name: 'Processing',
    description: 'Your order is being prepared for shipment',
    icon: CogIcon,
    iconSolid: CogIconSolid,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 'SHIPPED',
    name: 'Shipped',
    description: 'Your order is on its way to you',
    icon: TruckIcon,
    iconSolid: TruckIconSolid,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    id: 'DELIVERED',
    name: 'Delivered',
    description: 'Your order has been delivered successfully',
    icon: HomeIcon,
    iconSolid: HomeIconSolid,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
];

const specialStatuses: Record<string, StatusStep> = {
  CANCELLED: {
    id: 'CANCELLED',
    name: 'Order Cancelled',
    description: 'This order has been cancelled',
    icon: XCircleIcon,
    iconSolid: XCircleIconSolid,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  REFUND_REQUESTED: {
    id: 'REFUND_REQUESTED',
    name: 'Refund Requested',
    description: 'A refund has been requested for this order',
    icon: ExclamationTriangleIcon,
    iconSolid: ExclamationTriangleIconSolid,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  REFUNDED: {
    id: 'REFUNDED',
    name: 'Refunded',
    description: 'This order has been refunded',
    icon: ArrowUturnLeftIcon,
    iconSolid: ArrowUturnLeftIconSolid,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
};

export default function OrderStatusTimeline({
  currentStatus,
  orderDate,
  estimatedDelivery,
}: OrderStatusTimelineProps) {
  // Handle special statuses
  if (specialStatuses[currentStatus]) {
    const status = specialStatuses[currentStatus];
    const IconComponent = status.iconSolid;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h3>
        
        <div className="flex items-center space-x-4">
          <div className={`flex-shrink-0 w-12 h-12 ${status.bgColor} rounded-full flex items-center justify-center`}>
            <IconComponent className={`w-6 h-6 ${status.color}`} />
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900">{status.name}</h4>
            <p className="text-sm text-gray-600">{status.description}</p>
            <p className="text-xs text-gray-500 mt-1">
              Order placed on {new Date(orderDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get current step index
  const currentStepIndex = statusSteps.findIndex(step => step.id === currentStatus);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Progress</h3>
      
      <div className="space-y-6">
        {statusSteps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const IconComponent = isCompleted ? step.iconSolid : step.icon;
          
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-start space-x-4"
            >
              {/* Connector line */}
              {index < statusSteps.length - 1 && (
                <div
                  className={`absolute left-6 top-12 w-0.5 h-6 ${
                    isCompleted ? 'bg-primary-200' : 'bg-gray-200'
                  }`}
                />
              )}
              
              {/* Icon */}
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isCompleted
                    ? `${step.bgColor} ring-2 ring-primary-100`
                    : isCurrent
                    ? 'bg-primary-50 ring-2 ring-primary-200'
                    : 'bg-gray-100'
                }`}
              >
                <IconComponent
                  className={`w-6 h-6 transition-all duration-200 ${
                    isCompleted
                      ? step.color
                      : isCurrent
                      ? 'text-primary-600'
                      : 'text-gray-400'
                  }`}
                />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4
                  className={`text-sm font-medium transition-all duration-200 ${
                    isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </h4>
                <p
                  className={`text-sm transition-all duration-200 ${
                    isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  {step.description}
                </p>
                
                {/* Show dates for completed steps */}
                {isCompleted && (
                  <p className="text-xs text-gray-500 mt-1">
                    {step.id === 'PENDING' && `Order placed on ${new Date(orderDate).toLocaleDateString()}`}
                    {step.id === 'DELIVERED' && estimatedDelivery && `Estimated delivery: ${new Date(estimatedDelivery).toLocaleDateString()}`}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Estimated delivery for shipped orders */}
      {currentStatus === 'SHIPPED' && estimatedDelivery && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <TruckIconSolid className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Estimated delivery: {new Date(estimatedDelivery).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
