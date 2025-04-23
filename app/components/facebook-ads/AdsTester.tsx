// 'use client';

// import { useState, useEffect } from 'react';
// import { fetchFacebookAdsWithPagination } from '@/app/lib/facebook-ads-service';
// import { FacebookAd } from '@/app/types/facebook-ads';

// export default function AdsTester() {
//   const [ads, setAds] = useState<FacebookAd[]>([]);
//   const [count, setCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [page, setPage] = useState(1);
//   const pageSize = 5;

//   useEffect(() => {
//     async function loadAds() {
//       try {
//         setLoading(true);
//         setError(null);
//         const { data, count } = await fetchFacebookAdsWithPagination(page, pageSize);
//         setAds(data);
//         setCount(count);
//       } catch (err) {
//         setError('Failed to load Facebook ads. Please try again later.');
//         console.error('Error loading ads:', err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadAds();
//   }, [page]);

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <h2 className="text-xl font-semibold mb-4">Facebook Ads Tester</h2>
      
//       {loading && (
//         <div className="flex justify-center my-8">
//           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       )}
      
//       {error && (
//         <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
//           {error}
//         </div>
//       )}
      
//       {!loading && ads.length === 0 && !error && (
//         <p className="text-gray-600">No Facebook ads found.</p>
//       )}
      
//       {ads.length > 0 && (
//         <div>
//           <p className="text-gray-600 mb-4">Found {count} ads in total.</p>
          
//           <div className="space-y-4">
//             {ads.map(ad => (
//               <div key={ad.id} className="border border-gray-200 rounded p-4">
//                 <p className="text-sm text-gray-500 mb-2">ID: {ad.id}</p>
//                 {ad.advertiser_name && (
//                   <p className="font-medium mb-1">Advertiser: {ad.advertiser_name}</p>
//                 )}
//                 {ad.ad_text && (
//                   <p className="mb-2">{ad.ad_text}</p>
//                 )}
//                 {ad.media_url && (
//                   <div className="mt-2">
//                     {ad.media_type === 'image' ? (
//                       <img 
//                         src={ad.media_url} 
//                         alt="Ad media" 
//                         className="max-w-full h-auto rounded"
//                         style={{ maxHeight: '200px' }}
//                       />
//                     ) : ad.media_type === 'video' ? (
//                       <video 
//                         src={ad.media_url} 
//                         controls 
//                         className="max-w-full h-auto rounded"
//                         style={{ maxHeight: '200px' }}
//                       />
//                     ) : (
//                       <p className="text-gray-500 italic">Media type: {ad.media_type || 'unknown'}</p>
//                     )}
//                   </div>
//                 )}
//                 <p className="text-xs text-gray-500 mt-2">
//                   Captured: {new Date(ad.captured_at).toLocaleString()}
//                 </p>
//               </div>
//             ))}
//           </div>
          
//           {/* Simple pagination */}
//           <div className="flex justify-between mt-6">
//             <button
//               onClick={() => setPage(page => Math.max(1, page - 1))}
//               disabled={page === 1}
//               className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
//             >
//               Previous
//             </button>
//             <span className="py-2">
//               Page {page} of {Math.ceil(count / pageSize) || 1}
//             </span>
//             <button
//               onClick={() => setPage(page => page + 1)}
//               disabled={page >= Math.ceil(count / pageSize)}
//               className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       )}
      
//       {/* Raw Data Dump for testing */}
//       <div className="mt-8 border-t pt-4">
//         <h3 className="font-medium mb-2">Raw Data:</h3>
//         <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs" style={{ maxHeight: '300px' }}>
//           {JSON.stringify(ads, null, 2)}
//         </pre>
//       </div>
//     </div>
//   );
// } 