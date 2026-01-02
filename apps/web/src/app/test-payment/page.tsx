// File: apps/web/src/app/test-payment/page.tsx
// Complete Pi Network Payment Test Page

'use client';

import { useEffect, useState } from 'react';

export default function TestPaymentPage() {
  const [piReady, setPiReady] = useState(false);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if Pi SDK is loaded
    const checkPi = () => {
      if (typeof window !== 'undefined' && (window as any).Pi) {
        setPiReady(true);
        console.log('✅ Pi SDK loaded successfully');
      } else {
        console.log('⏳ Waiting for Pi SDK...');
        setTimeout(checkPi, 500);
      }
    };
    checkPi();
  }, []);

  const initPi = async () => {
    if (!piReady) {
      setResult('❌ Error: Pi SDK not loaded. Please open in Pi Browser.');
      return;
    }

    setLoading(true);
    try {
      const Pi = (window as any).Pi;
      await Pi.init({ version: "2.0", sandbox: false });
      setSdkInitialized(true);
      setResult('✅ Pi SDK initialized successfully! Ready for payment.');
      console.log('Pi SDK initialized');
    } catch (error: any) {
      setResult(`❌ Init Error: ${error.message}`);
      console.error('Init error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testPayment = async () => {
    if (!piReady) {
      setResult('❌ Error: Pi SDK not loaded. Please open in Pi Browser.');
      return;
    }

    setLoading(true);
    setResult('🔄 Initializing payment...');

    try {
      const Pi = (window as any).Pi;
      
      // Ensure SDK is initialized
      try {
        await Pi.init({ version: "2.0", sandbox: false });
      } catch (initError) {
        console.log('SDK already initialized or init error:', initError);
      }
      
      // Wait a moment for SDK to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResult('🔄 Creating payment request...');
      
      Pi.createPayment(
        {
          amount: 3.14,
          memo: "Step 10 Validation Test",
          metadata: { 
            orderId: "test_step_10",
            timestamp: Date.now()
          }
        },
        {
          onReadyForServerApproval: (paymentId: string) => {
            setResult(`✅ Payment Created!\n\nPayment ID: ${paymentId}\n\nWaiting for your approval in Pi app...`);
            console.log('Payment ready for approval:', paymentId);
            
            // Call backend approval endpoint
            fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId })
            }).then(res => {
              console.log('Approval endpoint response:', res.status);
            });
          },
          
          onReadyForServerCompletion: (paymentId: string, txid: string) => {
            setResult(`🎉 SUCCESS! Payment Completed!\n\nPayment ID: ${paymentId}\nTransaction ID: ${txid}\n\n✅ Step 10 should now be completed in Pi Developer Portal!`);
            console.log('Payment completed:', { paymentId, txid });
            setLoading(false);
            
            // Call backend completion endpoint
            fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid })
            });
          },
          
          onCancel: (paymentId: string) => {
            setResult(`❌ Payment Cancelled\n\nPayment ID: ${paymentId}\n\nPlease try again.`);
            console.log('Payment cancelled:', paymentId);
            setLoading(false);
          },
          
          onError: (error: any, payment?: any) => {
            setResult(`❌ Payment Error\n\nError: ${error.message}\n\n${payment ? `Payment ID: ${payment.identifier}` : ''}`);
            console.error('Payment error:', error, payment);
            setLoading(false);
          }
        }
      );
    } catch (error: any) {
      setResult(`❌ Payment Creation Failed\n\nError: ${error.message}\n\nMake sure you're using Pi Browser!`);
      console.error('Payment creation error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-950 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-2xl p-6 sm:p-8 mb-6 border border-white/20">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-4xl">
              π
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-white mb-2">
            Pi Network Payment Test
          </h1>
          <p className="text-center text-gray-300 text-sm sm:text-base">
            Test your Pi Network integration for Step 10
          </p>
        </div>

        {/* SDK Status */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-xl p-6 mb-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">SDK Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-gray-300">Pi SDK Loaded:</span>
              <span className={`font-bold ${piReady ? 'text-green-400' : 'text-red-400'}`}>
                {piReady ? '✅ Ready' : '❌ Not Loaded'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-gray-300">SDK Initialized:</span>
              <span className={`font-bold ${sdkInitialized ? 'text-green-400' : 'text-gray-400'}`}>
                {sdkInitialized ? '✅ Yes' : '⏳ Not Yet'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-gray-300">Browser:</span>
              <span className="font-bold text-blue-400">
                {typeof window !== 'undefined' && (window as any).Pi ? 'Pi Browser ✅' : 'Unknown Browser ⚠️'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-xl p-6 mb-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Test Actions</h2>
          <div className="space-y-4">
            <button
              onClick={initPi}
              disabled={!piReady || loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              {loading ? '⏳ Processing...' : '1️⃣ Initialize Pi SDK'}
            </button>

            <button
              onClick={testPayment}
              disabled={!piReady || loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-purple-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              {loading ? '⏳ Processing...' : '2️⃣ Test Payment (π 3.14)'}
            </button>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-xl p-6 mb-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Result</h2>
            <div className="bg-black/30 p-4 rounded-lg border border-white/10">
              <pre className="font-mono text-sm text-gray-100 whitespace-pre-wrap break-words">
                {result}
              </pre>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-lg shadow-xl p-6 border border-yellow-400/30">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">📋</span>
            Instructions
          </h2>
          <ol className="space-y-3 text-gray-200">
            <li className="flex items-start">
              <span className="font-bold mr-2 text-yellow-400">1.</span>
              <span><strong>Open this page in Pi Browser</strong> (not Chrome, Safari, etc.)</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2 text-yellow-400">2.</span>
              <span>Click <strong>"Initialize Pi SDK"</strong> button and wait for success message</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2 text-yellow-400">3.</span>
              <span>Click <strong>"Test Payment"</strong> button to create a payment</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2 text-yellow-400">4.</span>
              <span>Approve the payment in the Pi app when prompted</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2 text-yellow-400">5.</span>
              <span>Wait for the transaction to complete</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2 text-yellow-400">6.</span>
              <span>Check <strong>Pi Developer Portal → Step 10</strong> - it should now be marked as completed! ✅</span>
            </li>
          </ol>

          <div className="mt-6 p-4 bg-red-500/20 rounded-lg border border-red-400/30">
            <p className="text-sm text-red-200">
              ⚠️ <strong>Important:</strong> This page ONLY works in Pi Browser. If you're seeing "SDK not loaded" error, 
              you're not using Pi Browser.
            </p>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-6 bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-white/10">
          <details className="cursor-pointer">
            <summary className="text-gray-300 font-semibold mb-2">🔧 Debug Information</summary>
            <div className="mt-2 space-y-2 text-sm">
              <p className="text-gray-400">
                <strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}
              </p>
              <p className="text-gray-400">
                <strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 100) : 'N/A'}...
              </p>
              <p className="text-gray-400">
                <strong>Pi Object Available:</strong> {typeof window !== 'undefined' && (window as any).Pi ? 'Yes ✅' : 'No ❌'}
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
