import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// MOCK DATA CONFIGURATION
// Other agents can edit these variables to change the scenario
// ==========================================
export const mockData = {
  // User Info
  userName: "VALENTINE",
  userPhoneMasked: "812****358",
  userBalance: "3.86",
  owealthBalance: "3.86",
  
  // Recipient Info
  recipientName: "KANE ALIYU ALHAJI",
  recipientAccount: "0216633943",
  recipientBank: "Union Bank Of Nigeria",
  recipientBankLogo: "🐎",
  recipientBankColor: "bg-blue-400",
  
  // Transaction Details
  transferAmount: "10,000.00",
  transferAmountNumber: 10000,
  stampDuty: "50.00",
  fee: "0.00",
  
  // Device Mock Info
  time: "10:38 PM",
  battery: "51%",
  network: "4G",
};

export default function HowItWorks() {
  const navigate = useNavigate();
  // Steps: 1=Login, 2=Home, 3=Transfer Recipient, 4=Transfer Amount, 5=Reminder Modal, 6=Payment Method Bottom Sheet
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');

  return (
    <div className="w-full h-full bg-white relative font-sans text-gray-800 flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        
        {/* STEP 1: LOGIN */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-between py-12 px-6 bg-white"
          >
            {/* Top Bar Mock */}
            <div className="w-full flex justify-between text-[11px] text-gray-500 font-medium mb-12">
              <span>{mockData.time}</span>
              <div className="flex gap-1">
                <span>{mockData.network}</span>
                <span>{mockData.battery}</span>
              </div>
            </div>

            <div className="flex flex-col items-center flex-1 w-full pt-12">
              <div className="text-3xl font-bold text-[#01C38E] flex items-center gap-2 mb-16">
                <div className="w-8 h-8 rounded-full border-4 border-[#01C38E] border-l-transparent rotate-45 relative">
                   <div className="absolute top-1/2 left-1/2 w-3 h-1 bg-[#2C216C] -translate-y-1/2"></div>
                </div>
                <span className="text-[#2C216C]">Pay</span>
              </div>
              
              <div className="text-[17px] font-medium text-gray-800 mb-16">
                {mockData.userName}({mockData.userPhoneMasked})
              </div>

              {/* Fingerprint Icon Mock */}
              <div 
                className="w-16 h-16 border-2 border-gray-800 rounded-full flex items-center justify-center mb-6 cursor-pointer opacity-80"
                onClick={() => setStep(2)}
              >
                <div className="w-10 h-10 border-[3px] border-[#01C38E] rounded-full border-t-transparent opacity-80 rotate-12"></div>
              </div>

              <div className="text-[#01C38E] font-medium text-[15px] mb-4">
                Click to log in with Fingerprint
              </div>

              <button 
                onClick={() => setStep(2)}
                className="bg-[#01C38E] text-white font-bold py-3 px-8 rounded-full text-[15px] shadow-md"
              >
                Verify Fingerprint
              </button>
            </div>

            <div className="flex gap-4 text-[#01C38E] font-medium text-[13px] pt-8">
              <span>Switch Account</span>
              <span className="text-gray-300">|</span>
              <span>Login with Password</span>
            </div>
            
            {/* Close mock back to settings */}
            <button 
              onClick={() => navigate(-1)} 
              className="absolute top-12 left-4 text-gray-400 p-2 z-50 text-[12px] uppercase font-bold"
            >
              Exit Demo
            </button>
          </motion.div>
        )}

        {/* STEP 2: HOME SCREEN */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col bg-[#F5F6F8] overflow-y-auto pb-20"
          >
            {/* Status Bar */}
            <div className="w-full flex justify-between text-[11px] text-gray-500 font-medium p-4 bg-white">
              <span>{mockData.time}</span>
              <div className="flex gap-1"><span>{mockData.network}</span><span>{mockData.battery}</span></div>
            </div>

            {/* Header */}
            <div className="bg-white px-4 pb-4 flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-yellow-400 border-2 border-gray-100 flex items-center justify-center text-white text-xs overflow-hidden">
                    <img src={`https://ui-avatars.com/api/?name=${mockData.userName[0]}&background=f1c40f&color=fff`} alt="avatar" />
                 </div>
                 <div className="font-bold text-[15px]">Hi, {mockData.userName}</div>
               </div>
               <div className="flex gap-4 items-center">
                 <div className="w-6 h-6 border-2 border-gray-800 rounded-full relative"><span className="absolute -top-1 -right-1 text-[8px] bg-pink-500 text-white px-1 rounded">HELP</span></div>
                 <div className="w-6 h-6 border-2 border-gray-800 rounded-md"></div>
                 <div className="w-6 h-6 rounded-full bg-gray-200 relative">
                   <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center">21</div>
                 </div>
               </div>
            </div>

            {/* Balance Card */}
            <div className="px-4 mt-2">
              <div className="bg-[#01C38E] rounded-[20px] p-5 text-white shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center gap-2 text-[13px] font-medium opacity-90">
                     <span className="w-3 h-3 bg-white/20 rounded-full inline-block"></span> Available Balance 
                   </div>
                   <div className="text-[12px] font-medium opacity-90">Transaction History &gt;</div>
                </div>
                <div className="flex justify-between items-end">
                   <div className="text-[28px] font-bold">₦{mockData.userBalance} &gt;</div>
                   <button className="bg-white text-[#01C38E] text-[13px] font-bold px-4 py-2 rounded-full">+ Add Money</button>
                </div>
              </div>
            </div>

            {/* OWealth */}
            <div className="px-4 mt-3">
              <div className="bg-white rounded-[20px] p-4 flex flex-col gap-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">%</div>
                     <div>
                       <div className="text-[14px] font-medium text-gray-800">OWealth Interest Earned</div>
                       <div className="text-[11px] text-gray-400">Jul 19th, 01:12:02</div>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-[#01C38E] font-bold text-[15px]">+₦0.09</div>
                     <div className="text-[#01C38E] text-[11px] opacity-80">Successful</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4 mt-3">
              <div className="bg-white rounded-[20px] p-5 shadow-sm">
                <div className="grid grid-cols-3 gap-y-6 mb-6">
                  <div className="flex flex-col items-center gap-2 cursor-pointer">
                    <div className="w-10 h-10 bg-[#01C38E] rounded-[14px] flex items-center justify-center text-white"><span className="text-lg">O</span></div>
                    <span className="text-[12px] font-medium text-gray-600">To OPay</span>
                  </div>
                  <div 
                    className="flex flex-col items-center gap-2 cursor-pointer"
                    onClick={() => setStep(3)}
                  >
                    <div className="w-10 h-10 bg-[#01C38E] rounded-[14px] flex items-center justify-center text-white"><span className="text-lg">🏦</span></div>
                    <span className="text-[12px] font-medium text-gray-800">To Bank</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 cursor-pointer">
                    <div className="w-10 h-10 bg-[#01C38E] rounded-[14px] flex items-center justify-center text-white"><span className="text-lg">↘</span></div>
                    <span className="text-[12px] font-medium text-gray-600">Withdraw</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Nav Mock */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3 pb-6">
               <div className="flex flex-col items-center text-[#01C38E] font-bold text-[10px] gap-1">
                 <div className="w-6 h-6 rounded-full border-2 border-[#01C38E]"></div>Home
               </div>
               <div className="flex flex-col items-center text-gray-400 font-medium text-[10px] gap-1">
                 <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>Rewards
               </div>
               <div className="flex flex-col items-center text-gray-400 font-medium text-[10px] gap-1">
                 <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>Finance
               </div>
               <div className="flex flex-col items-center text-gray-400 font-medium text-[10px] gap-1">
                 <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>Cards
               </div>
               <div className="flex flex-col items-center text-gray-400 font-medium text-[10px] gap-1">
                 <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>Me
               </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: TRANSFER RECIPIENT */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="absolute inset-0 flex flex-col bg-[#F5F6F8]"
          >
            <div className="w-full flex justify-between text-[11px] text-gray-500 font-medium p-4 bg-white">
              <span>{mockData.time}</span>
              <div className="flex gap-1"><span>{mockData.network}</span><span>{mockData.battery}</span></div>
            </div>
            <div className="bg-white px-4 py-3 flex items-center justify-between pb-4 shadow-sm z-10 relative">
               <div className="flex items-center gap-3">
                 <button onClick={() => setStep(2)} className="text-xl px-1">&lt;</button>
                 <div className="font-medium text-[17px] text-gray-800">Transfer to Bank Account</div>
               </div>
               <div className="text-[#01C38E] text-[15px] font-medium">History</div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <div className="bg-green-50 rounded-xl p-3 flex justify-between items-center mb-3">
                 <div className="flex items-center gap-2">
                   <div className="w-10 h-10 bg-green-200 rounded text-[10px] flex items-center justify-center text-green-800 font-bold">530</div>
                   <div className="text-[13px] font-bold text-gray-800">Claim 15 Discounts with<br/><span className="text-[#01C38E] text-[16px]">₦ 99</span> on any Bill</div>
                 </div>
                 <button className="bg-[#01C38E] text-white px-4 py-1.5 rounded-full text-[13px] font-bold">Claim</button>
              </div>

              <div className="bg-white rounded-[20px] p-5 shadow-sm mb-4 mt-4">
                 <div className="font-bold text-[15px] text-gray-800 mb-6">Recipient Account</div>
                 <div className="mb-6 pb-2 border-b border-gray-100">
                    <input type="text" placeholder="Enter 10 digits Account Number" className="w-full outline-none text-[15px] placeholder-gray-300" readOnly onClick={() => setStep(4)} />
                 </div>
                 <div className="mb-8 pb-2 border-b border-gray-100 flex justify-between items-center text-gray-300">
                    <span className="text-[15px]">Select Bank</span>
                    <span>&gt;</span>
                 </div>
                 <button className="w-full bg-[#A8E6CF] text-white font-bold py-3.5 rounded-full text-[15px]">Next</button>
              </div>

              <div className="bg-white rounded-t-[20px] p-5 shadow-sm flex-1">
                 <div className="flex gap-6 border-b border-gray-100 pb-3 mb-4 font-bold text-[15px]">
                    <span className="text-[#01C38E] border-b-2 border-[#01C38E] pb-3 -mb-[14px]">Recents</span>
                    <span className="text-gray-400">Favourites</span>
                 </div>

                 {/* Clickable Target Recipient */}
                 <div 
                   className="flex items-center justify-between py-4 border-b border-gray-50 cursor-pointer"
                   onClick={() => setStep(4)}
                 >
                    <div>
                      <div className="text-[14px] text-gray-800 uppercase">{mockData.recipientName}</div>
                      <div className="text-[12px] text-gray-400 mt-1">{mockData.recipientAccount} {mockData.recipientBank}</div>
                    </div>
                    <div className={`w-8 h-8 ${mockData.recipientBankColor} rounded-full text-white font-bold flex items-center justify-center text-[14px]`}>
                      {mockData.recipientBankLogo}
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 4/5/6: TRANSFER AMOUNT & MODALS */}
        {step >= 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col bg-[#F5F6F8]"
          >
            <div className="w-full flex justify-between text-[11px] text-gray-500 font-medium p-4 bg-white">
              <span>{mockData.time}</span>
              <div className="flex gap-1"><span>{mockData.network}</span><span>{mockData.battery}</span></div>
            </div>
            <div className="bg-white px-4 py-3 flex items-center gap-3 pb-4 shadow-sm z-10 relative">
               <button onClick={() => setStep(3)} className="text-xl px-1">&lt;</button>
               <div className="font-medium text-[17px] text-gray-800">Transfer to Bank Account</div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <div className="flex items-center gap-3 mb-6 bg-transparent px-2">
                 <div className={`w-12 h-12 ${mockData.recipientBankColor} rounded-full text-white flex items-center justify-center text-xl relative`}>
                   {mockData.recipientBankLogo} <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-[8px]">▲</div>
                 </div>
                 <div>
                   <div className="text-[14px] font-bold text-gray-800 uppercase">{mockData.recipientName}</div>
                   <div className="text-[13px] text-gray-500 mt-0.5">{mockData.recipientAccount} {mockData.recipientBank}</div>
                 </div>
              </div>

              <div className="bg-white rounded-[20px] p-5 shadow-sm mb-4">
                 <div className="font-bold text-[15px] text-gray-800 mb-4">Amount</div>
                 
                 {/* Amount Input area */}
                 <div className="mb-4 pb-2 border-b-2 border-[#01C38E] flex items-end gap-2 relative">
                    <span className="text-[28px] font-bold text-gray-800">₦</span>
                    <input 
                      type="text" 
                      className="w-full outline-none text-[32px] font-bold text-gray-800 bg-transparent placeholder-gray-300 h-10" 
                      placeholder="100.00 - 5,000,000.00"
                      value={amount}
                      readOnly
                      onClick={() => setAmount(mockData.transferAmount)}
                    />
                    {amount === mockData.transferAmount && mockData.transferAmountNumber >= 10000 && (
                      <div className="absolute -top-4 left-10 bg-gray-500 text-white text-[10px] px-2 py-0.5 rounded opacity-80 whitespace-nowrap">
                        Tens of Thousands
                      </div>
                    )}
                 </div>
                 
                 {amount === mockData.transferAmount && (
                   <div className="flex justify-between items-center text-[12px] text-gray-500 mb-6">
                     <span>Stamp Duty ⓘ</span>
                     <span>₦{mockData.stampDuty}</span>
                   </div>
                 )}

                 {/* Suggestions */}
                 <div className="grid grid-cols-3 gap-3">
                    {['₦500', '₦1,000', '₦2,000', '₦5,000', '₦9,999'].map(val => (
                      <div key={val} className="bg-gray-50 rounded-xl py-3 text-center text-[14px] font-medium text-gray-700">{val}</div>
                    ))}
                    <div 
                      className={`${amount === mockData.transferAmount ? 'bg-green-100 text-[#01C38E]' : 'bg-gray-50 text-gray-700'} rounded-xl py-3 text-center text-[14px] font-medium cursor-pointer`}
                      onClick={() => setAmount(mockData.transferAmount)}
                    >
                      ₦{mockData.transferAmount.split('.')[0]}
                    </div>
                 </div>
              </div>

              <div className="bg-white rounded-[20px] p-5 shadow-sm">
                 <div className="font-bold text-[15px] text-gray-800 mb-4">Remark</div>
                 <div className="mb-4 pb-2 border-b border-gray-100">
                    <input type="text" placeholder="What's this for?(Optional)" className="w-full outline-none text-[14px] placeholder-gray-300" readOnly />
                 </div>
                 <div className="flex gap-4">
                    <div className="flex-1 bg-gray-50 rounded-xl py-3 text-center text-[13px] font-medium text-gray-600">Purchase</div>
                    <div className="flex-1 bg-gray-50 rounded-xl py-3 text-center text-[13px] font-medium text-gray-600">Personal</div>
                 </div>
              </div>
            </div>

            <div className="p-4 bg-[#F5F6F8]">
               <button 
                 className={`w-full py-3.5 rounded-full font-bold text-[16px] transition-colors ${amount === mockData.transferAmount ? 'bg-[#01C38E] text-white shadow-[0_4px_14px_rgba(1,195,142,0.4)]' : 'bg-[#A8E6CF] text-white'}`}
                 onClick={() => amount === mockData.transferAmount && setStep(5)}
               >
                 Confirm
               </button>
            </div>

            {/* OVERLAY for STEP 5: REMINDER MODAL */}
            {step === 5 && (
              <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white rounded-3xl w-full max-w-[90%] overflow-hidden relative"
                >
                  <button className="absolute top-4 right-4 text-gray-400" onClick={() => setStep(4)}>✕</button>
                  <div className="p-6 text-center">
                    <h3 className="text-[18px] font-bold text-gray-800 mb-4">Reminder</h3>
                    <p className="text-[14px] text-gray-500 mb-6 leading-relaxed">
                      Double check the transfer details before you proceed. Please note that successful transfers cannot be reversed.
                    </p>
                    
                    <div className="bg-[#F8F9FB] rounded-2xl p-4 text-left mb-8">
                       <div className="font-bold text-[14px] mb-4">Transaction Details</div>
                       <div className="flex justify-between text-[13px] mb-3"><span className="text-gray-500">Name</span><span className="font-medium">{mockData.recipientName}</span></div>
                       <div className="flex justify-between text-[13px] mb-3"><span className="text-gray-500">Account No.</span><span className="font-medium">{mockData.recipientAccount}</span></div>
                       <div className="flex justify-between text-[13px] mb-3"><span className="text-gray-500">Bank</span><span className="font-medium">{mockData.recipientBank}</span></div>
                       <div className="flex justify-between text-[13px] mt-6 relative">
                         <span className="text-gray-500">Amount</span>
                         <div className="flex flex-col items-end">
                           {mockData.transferAmountNumber >= 10000 && (
                             <div className="bg-gray-500 text-white text-[10px] px-2 py-0.5 rounded opacity-80 mb-1">Tens of Thousands</div>
                           )}
                           <span className="font-bold text-[16px]">₦{mockData.transferAmount}</span>
                         </div>
                       </div>
                    </div>

                    <div className="flex gap-4">
                       <button 
                         className="flex-1 bg-green-50 text-[#01C38E] font-bold py-3.5 rounded-full"
                         onClick={() => setStep(4)}
                       >
                         Recheck
                       </button>
                       <button 
                         className="flex-[1.5] bg-[#01C38E] text-white font-bold py-3.5 rounded-full"
                         onClick={() => setStep(6)}
                       >
                         Continue
                       </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* OVERLAY for STEP 6: PAYMENT METHOD BOTTOM SHEET */}
            {step === 6 && (
              <div className="absolute inset-0 bg-black/40 z-30 flex flex-col justify-end">
                <motion.div 
                  initial={{ y: 300, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  className="bg-white rounded-t-3xl w-full flex flex-col"
                >
                  <div className="p-4 flex justify-between items-center border-b border-gray-100">
                    <button className="text-gray-400 text-lg px-2" onClick={() => setStep(4)}>✕</button>
                    <span className="text-[#01C38E] text-[13px] font-bold px-2">Use Payment PIN</span>
                  </div>
                  
                  <div className="p-6 text-center">
                    <div className="text-[32px] font-bold text-gray-800 mb-6">₦{mockData.transferAmount}</div>
                    
                    <div className="flex justify-between text-[13px] mb-4">
                      <span className="text-gray-500">Bank</span>
                      <span className="font-medium text-blue-500 flex items-center gap-1">{mockData.recipientBankLogo} {mockData.recipientBank}</span>
                    </div>
                    <div className="flex justify-between text-[13px] mb-4">
                      <span className="text-gray-500">Account Number</span>
                      <span className="font-medium">{mockData.recipientAccount}</span>
                    </div>
                    <div className="flex justify-between text-[13px] mb-4">
                      <span className="text-gray-500">Name</span>
                      <span className="font-medium">{mockData.recipientName}</span>
                    </div>
                    <div className="flex justify-between text-[13px] mb-4 relative">
                      <span className="text-gray-500">Amount</span>
                      <div className="flex flex-col items-end">
                         {mockData.transferAmountNumber >= 10000 && (
                           <span className="bg-green-100 text-[#01C38E] text-[10px] px-2 py-0.5 rounded mb-1">Tens of Thousands</span>
                         )}
                         <span className="font-medium">₦{mockData.transferAmount}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-[13px] mb-6">
                      <span className="text-gray-500">Fee</span>
                      <span className="font-medium">₦{mockData.fee}</span>
                    </div>

                    <div className="flex justify-between text-[14px] font-bold mb-4">
                      <span className="text-gray-400 font-medium">Payment Method</span>
                      <span className="text-gray-500">All &gt;</span>
                    </div>

                    {/* Insufficient Balance Card */}
                    <div className="border border-gray-100 rounded-[20px] p-4 text-left relative overflow-hidden shadow-sm">
                       <div className="flex items-center gap-2 mb-2">
                         <div className="w-5 h-5 rounded-full border-[5px] border-[#01C38E] bg-white"></div>
                         <span className="font-bold text-[14px]">Available Balance <span className="font-normal text-gray-500 text-[12px]">(₦{mockData.userBalance})</span></span>
                         <span className="text-gray-300 text-[11px]">ⓘ</span>
                       </div>
                       <div className="text-red-500 text-[12px] font-medium ml-7 mb-4">Insufficient balance</div>
                       
                       <hr className="border-dashed border-gray-200 mb-4" />
                       
                       <div className="flex justify-between items-center text-[13px] text-gray-400 mb-3 ml-7">
                         <span>Wallet (₦0.00)</span>
                         <span className="text-[#01C38E] font-medium">Add Money &gt;</span>
                       </div>
                       <div className="text-[13px] text-gray-400 ml-7">
                         <span>OWealth (₦{mockData.owealthBalance})</span>
                       </div>
                    </div>

                    <div className="border border-gray-100 rounded-[14px] p-4 text-left mt-4 flex items-center gap-3">
                       <span className="text-gray-500 font-bold">+</span>
                       <span className="text-[14px] font-medium text-gray-800">Add a Bank Card / Account</span>
                    </div>

                    <div className="mt-6 mb-2">
                      <button className="w-full bg-[#A8E6CF] text-white font-bold py-3.5 rounded-full text-[16px] cursor-not-allowed">
                        Pay
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
