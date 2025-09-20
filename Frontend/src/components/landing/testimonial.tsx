import { Testimonial } from '../types';

export const TestimonialCard = ({ quote, name, role, initial }: Omit<Testimonial, 'id'>) => {
  return (
  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-lg border-2 border-blue-200 p-6 rounded-lg hover:shadow-lg transition-all duration-300 z-10">
    <div className="mb-6">
      <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>
    </div>
    <p className="text-gray-700 mb-6">"{quote}"</p>
    <div className="flex items-center">
      <div className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-semibold">
        {initial}
      </div>
      <div className="ml-3">
        <p className="font-semibold text-gray-800">{name}</p>
        <p className="text-sm text-primary">{role}</p>
      </div>
    </div>
  </div>
  );
}