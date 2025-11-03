"use client";

export default function SizeGuidePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">Size Guide</h1>
      <p className="text-gray-600 text-center mb-12">
        Find your perfect fit with our comprehensive size guide.
      </p>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Women's Measurements</h2>
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-4 py-2">Size</th>
                  <th className="border px-4 py-2">Bust (inches)</th>
                  <th className="border px-4 py-2">Waist (inches)</th>
                  <th className="border px-4 py-2">Hips (inches)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2">XS</td>
                  <td className="border px-4 py-2">32-34</td>
                  <td className="border px-4 py-2">24-26</td>
                  <td className="border px-4 py-2">34-36</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">S</td>
                  <td className="border px-4 py-2">34-36</td>
                  <td className="border px-4 py-2">26-28</td>
                  <td className="border px-4 py-2">36-38</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">M</td>
                  <td className="border px-4 py-2">36-38</td>
                  <td className="border px-4 py-2">28-30</td>
                  <td className="border px-4 py-2">38-40</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">L</td>
                  <td className="border px-4 py-2">38-40</td>
                  <td className="border px-4 py-2">30-32</td>
                  <td className="border px-4 py-2">40-42</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">XL</td>
                  <td className="border px-4 py-2">40-42</td>
                  <td className="border px-4 py-2">32-34</td>
                  <td className="border px-4 py-2">42-44</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">How to Measure</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Bust:</strong> Measure around the fullest part of your bust</li>
            <li><strong>Waist:</strong> Measure around your natural waistline</li>
            <li><strong>Hips:</strong> Measure around the fullest part of your hips</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
          <p className="text-gray-700">
            For custom orders, we recommend providing your exact measurements. 
            Contact us if you need assistance with measuring.
          </p>
        </section>
      </div>
    </div>
  );
}