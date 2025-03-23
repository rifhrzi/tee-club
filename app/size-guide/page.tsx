"use client";

import Layout from "../../components/Layout";

export default function SizeGuide() {
  const sizeChart = [
    { size: "XS", chest: "34-36", length: "26", sleeve: "16" },
    { size: "S", chest: "36-38", length: "27", sleeve: "17" },
    { size: "M", chest: "38-40", length: "28", sleeve: "18" },
    { size: "L", chest: "40-42", length: "29", sleeve: "19" },
    { size: "XL", chest: "42-44", length: "30", sleeve: "20" },
    { size: "2XL", chest: "44-46", length: "31", sleeve: "21" },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Size Guide</h1>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chest (inches)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Length (inches)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sleeve (inches)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sizeChart.map((size) => (
                <tr key={size.size}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{size.size}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{size.chest}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{size.length}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{size.sleeve}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 prose lg:prose-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Measure</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</li>
            <li><strong>Length:</strong> Measure from the highest point of the shoulder to the bottom hem.</li>
            <li><strong>Sleeve:</strong> Measure from the shoulder seam to the end of the sleeve.</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}