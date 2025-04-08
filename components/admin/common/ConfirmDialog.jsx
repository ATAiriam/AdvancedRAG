'use client';

import { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const ConfirmDialog = ({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  icon = 'warning',
  onConfirm,
  onCancel,
  isMobile = false
}) => {
  const cancelButtonRef = useRef(null);
  
  // Determine icon component based on type
  const IconComponent = icon === 'warning' 
    ? ExclamationTriangleIcon 
    : InformationCircleIcon;
  
  // Determine icon background color
  const iconBgColor = danger 
    ? 'bg-red-100 dark:bg-red-900' 
    : 'bg-primary-light dark:bg-primary-dark';
  
  // Determine icon text color
  const iconTextColor = danger 
    ? 'text-red-600 dark:text-red-200' 
    : 'text-primary dark:text-primary-light';
  
  // Determine confirm button styles
  const confirmBtnClasses = danger
    ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white'
    : 'bg-primary hover:bg-primary-dark text-white';

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        initialFocus={cancelButtonRef} 
        onClose={onCancel}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className={`
                relative transform overflow-hidden rounded-lg 
                bg-white dark:bg-gray-900 
                text-left shadow-xl transition-all 
                w-full ${isMobile ? 'max-w-lg mx-4' : 'sm:max-w-lg sm:w-full sm:mx-auto'}
              `}>
                <div className="bg-white dark:bg-gray-900 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className={`
                      mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center 
                      rounded-full ${iconBgColor} sm:mx-0 sm:h-10 sm:w-10
                    `}>
                      <IconComponent className={`h-6 w-6 ${iconTextColor}`} aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
                        {title}
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {message}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`
                  ${isMobile 
                    ? 'px-4 py-3 flex flex-col sm:flex-row-reverse space-y-3 sm:space-y-0 sm:space-x-3 sm:space-x-reverse' 
                    : 'bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6'}
                `}>
                  <button
                    type="button"
                    className={`
                      ${confirmBtnClasses}
                      ${isMobile ? 'w-full py-3' : 'w-full sm:w-auto sm:ml-3'}
                      inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                      dark:focus:ring-offset-gray-900
                    `}
                    onClick={onConfirm}
                  >
                    {confirmLabel}
                  </button>
                  <button
                    type="button"
                    className={`
                      mt-3 inline-flex justify-center rounded-md
                      bg-white dark:bg-gray-700 px-4 py-2
                      text-sm font-medium text-gray-700 dark:text-gray-200
                      shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600
                      hover:bg-gray-50 dark:hover:bg-gray-600
                      ${isMobile ? 'w-full py-3 mt-0' : 'w-full sm:w-auto sm:mt-0'}
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                      dark:focus:ring-offset-gray-900
                    `}
                    onClick={onCancel}
                    ref={cancelButtonRef}
                  >
                    {cancelLabel}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ConfirmDialog;