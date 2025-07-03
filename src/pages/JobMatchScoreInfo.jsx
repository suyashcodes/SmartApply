import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const weights = [
  { label: 'Skills', value: 35, color: '#3B82F6' },
  { label: 'Experience', value: 25, color: '#10B981' },
  { label: 'Industry', value: 15, color: '#F59E0B' },
  { label: 'Location', value: 10, color: '#6366F1' },
  { label: 'Title', value: 15, color: '#EF4444' },
];

const pieData = {
  labels: weights.map(w => w.label),
  datasets: [
    {
      data: weights.map(w => w.value),
      backgroundColor: weights.map(w => w.color),
      borderWidth: 1,
    },
  ],
};

const barData = {
  labels: ['Skills', 'Experience', 'Industry', 'Location', 'Title'],
  datasets: [
    {
      label: 'Weight (%)',
      data: [35, 25, 15, 10, 15],
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EF4444'
      ],
      borderRadius: 6,
    },
  ],
};

export default function JobMatchScoreInfo() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">How is the Job Matching Score Calculated?</h1>
      <p className="mb-6 text-gray-700 text-lg">
        The job matching score is a weighted combination of several factors that reflect how well your profile fits a job. Each factor is scored out of 100, then combined using the weights below:
      </p>
      <div className="flex flex-col md:flex-row gap-8 mb-8 items-center">
        <div className="w-full md:w-1/2">
          <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom' } } }} />
        </div>
        <div className="w-full md:w-1/2">
          <Bar data={barData} options={{
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 40 } },
          }} />
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-blue-700 mb-2">Skills Match (35%)</h2>
          <p className="text-gray-700">Compares your skills and proficiency to the job's required and nice-to-have skills. Higher proficiency and more matches increase your score. Bonus points for matching nice-to-have skills.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-green-700 mb-2">Experience Match (25%)</h2>
          <p className="text-gray-700">Checks how your years of experience compare to the job's required level (entry, mid, senior, lead). Closer matches get higher scores.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">Industry Match (15%)</h2>
          <p className="text-gray-700">Measures how closely your industry background matches the job's industry.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-indigo-700 mb-2">Location/Work Type Match (10%)</h2>
          <p className="text-gray-700">Considers your location and work preference (remote, onsite, any) compared to the job's requirements. Remote jobs or matching preferences score higher.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Title Match (15%)</h2>
          <p className="text-gray-700">Compares your past job titles to the job's title. Higher similarity means a better score.</p>
        </div>
      </div>
      <div className="mt-10 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">In Summary</h3>
        <p className="text-gray-700">The higher your score, the better your fit for the job. Each section above contributes to your overall match, helping you quickly identify your best opportunities!</p>
      </div>
    </div>
  );
}
