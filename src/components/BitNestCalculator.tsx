'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

type RatesType = {
    [key: string]: number;
};

interface InvestmentResult {
    principal: number;
    period: string;
    compoundMode: boolean;
    compoundPeriods: string;
    returns: number;
    totalValue: number;
}

interface TargetReturnResult {
    targetReturn: number;
    period: string;
    requiredPrincipal: number;
    potentialReturns: number;
}

interface LoanCalculation {
    principalAmount: number;
    interestRate: number;
    periodInDays: number;
    totalInterestPaid: number;
    feePaid: number;
    totalAmountOwed: number;
}

interface BorrowedFundsResult {
    borrowedAmount: number;
    borrowPeriod: string;
    loan: LoanCalculation;
    withdrawPeriod: string;
    borrowPeriodReturns: number;
    netReturns: number;
    initialWithdrawReturns: number;
    withdrawReturns: number;
    totalNetProfit: number;
}

interface ReverseBorrowedFundsResult {
    desiredWithdrawAmount: number;
    borrowPeriod: string;
    withdrawPeriod: string;
    borrowedAmountNeeded: number;
    netReturnsNeeded: number;
    withdrawReturns: number;
    totalNetProfit: number;
    totalFees: number;
}

export const BitNestCalculator = () => {
    // Get invite code from URL if present
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        // Get URL parameters
        const params = new URLSearchParams(window.location.search);
        const code = params.get('invitecode');
        if (code) {
            setInviteCode(code);
        } else {
            setInviteCode('ZKPPQ');
        }
    }, []);

    const handleSignup = () => {
        if (inviteCode) {
            window.location.href = `https://bitnest.me/${inviteCode}`;
        }
    };

    const copySignup = async () => {
        if (inviteCode) {
            try {
                await navigator.clipboard.writeText(`https://bitnest.me/${inviteCode}`);
                setToastMessage('URL copied to clipboard!');
                setToastType('success');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } catch (err) {
                console.error('Failed to copy to clipboard:', err);
                setToastMessage('Failed to copy URL');
                setToastType('error');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
        }
    };

    // Investment rates
    const RATES: RatesType = {
        '1': 0.4,
        '7': 4,
        '14': 9.5,
        '28': 24
    };


    const InterestInterval: RatesType = {
        'Daily': 1,
        'Weekly': 7,
        'Bi-weekly': 14,
        'Credit Card': 21,
        'Monthly': 30,
        'Yearly': 365,
    };

    // State for main investment calculation
    const [principal, setPrincipal] = useState('');
    const [period, setPeriod] = useState('1'); // Default to 1 day
    const [compoundMode, setCompoundMode] = useState(false);
    const [compoundPeriods, setCompoundPeriods] = useState('1'); // Default to 1 day
    const [targetReturn, setTargetReturn] = useState('');

    // State for borrowed funds calculation
    const [borrowedAmount, setBorrowedAmount] = useState('');
    const [borrowPeriod, setBorrowPeriod] = useState('1'); // Default to 1 day
    const [borrowInterest, setBorrowInterest] = useState(''); // Default to 1 day
    const [interestInterval, setInterestInterval] = useState('1'); // Default to 1 day
    const [withdrawPeriod, setWithdrawPeriod] = useState('1'); // Default to 1 day
    const [borrowCompoundMode, setBorrowCompoundMode] = useState(false);
    const [BorrowCompoundPeriods, setBorrowCompoundPeriods] = useState('1'); // Default to 1 day
    const [desiredWithdrawAmount, setDesiredWithdrawAmount] = useState('');
    const [useUpfrontFee, setUseUpfrontFee] = useState(false);
    const [upfrontFeePercentage, setUpfrontFeePercentage] = useState(false);
    const [upfrontFee, setUpfrontFee] = useState('0');

    // State for results
    const [investmentResult, setInvestmentResult] = useState<InvestmentResult | null>(null);
    const [targetReturnResult, setTargetReturnResult] = useState<TargetReturnResult | null>(null);
    const [borrowedFundsResult, setBorrowedFundsResult] = useState<BorrowedFundsResult | null>(null);
    const [reverseBorrowedFundsResult, setReverseBorrowedFundsResult] = useState<ReverseBorrowedFundsResult | null>(null);
    const [withdrawPeriod2, setWithdrawPeriod2] = useState('1'); // Default to 1 day
    const [reverseBorrowPeriod, setReverseBorrowPeriod] = useState('1'); // Default to 1 day
    const [reverseBorrowInterest, setReverseBorrowInterest] = useState(''); // Default to 1 day
    const [reverseInterestInterval, setReverseInterestInterval] = useState('1'); // Default to 1 day

    // Calculate investment returns
    const calculateReturns = (principal: number, period: string, compound: boolean = false, periods: string = '1'): number => {
        console.log('period: ', period)
        const rate = RATES[period] / 100;
        console.log('rate: ', rate)
        const numPeriods = parseFloat(periods);
        console.log('numPeriods: ', numPeriods)

        if (compound) {
            return principal * Math.pow((1 + rate), numPeriods) - principal;
        }
        console.log('principal * rate: ', principal * rate)
        return principal * rate;
    };

    // Calculate required principal for target return
    const calculateRequiredPrincipal = (targetReturn: number, period: string): number => {
        const rate = RATES[period] / 100;
        return targetReturn / rate;
    };

    const calculateCreditCardInterest = (
        principalAmount: number,
        interestRate: number,
        periodInDays: number,
        interestInterval: string,
        upfrontFees: number
    ): LoanCalculation => {
        const interestIntervalNum = InterestInterval[interestInterval]
        console.log('principalAmount: ', principalAmount)
        console.log('interestRate: ', interestRate)
        console.log('interestInterval: ', interestInterval)
        console.log('interestIntervalNum: ', interestIntervalNum)
        // Convert annual interest rate to daily rate
        const dailyInterestRate = (interestRate / interestIntervalNum);
        console.log('dailyInterest: ', dailyInterestRate)
        console.log('periodInDays: ', periodInDays)

        const totalInterest = (dailyInterestRate * periodInDays) / 100

        console.log('totalInterest: ', totalInterest)
        // Calculate total interest paid for the specified number of days
        const totalInterestPaid = principalAmount * totalInterest;
        console.log('totalInterestPaid: ', totalInterestPaid)

        // Calculate total amount owed (principal + interest)
        const totalAmountOwed = principalAmount + totalInterestPaid + upfrontFees;
        console.log('totalAmountOwed: ', totalAmountOwed)

        return {
            principalAmount,
            interestRate: interestRate,
            periodInDays,
            totalInterestPaid,
            feePaid: upfrontFees,
            totalAmountOwed
        };
    }

    const handleMainCalculation = () => {
        const principalNum = parseFloat(principal || '0');
        const returns = calculateReturns(
            principalNum,
            period,
            compoundMode,
            compoundPeriods
        );

        const result: InvestmentResult = {
            principal: principalNum,
            period,
            compoundMode,
            compoundPeriods,
            returns,
            totalValue: principalNum + returns
        };

        setInvestmentResult(result);
    };

    const handleTargetReturnCalculation = () => {
        const targetReturnNum = parseFloat(targetReturn || '0');
        const requiredPrincipal = calculateRequiredPrincipal(
            targetReturnNum,
            period
        );

        const result: TargetReturnResult = {
            targetReturn: targetReturnNum,
            period,
            requiredPrincipal,
            potentialReturns: calculateReturns(requiredPrincipal, period)
        };

        setTargetReturnResult(result);
    };

    const handleBorrowedFundsCalculation = () => {
        const borrowedAmountNum = parseFloat(borrowedAmount || '0');
        const borrowInterestNum = parseFloat(borrowInterest || '0');
        const borrowPeriodNum = parseFloat(borrowPeriod || '0');
        const upfrontFeeNum = parseFloat(upfrontFee || '0');

        let upfrontFees = 0
        if (useUpfrontFee) {
            upfrontFees = upfrontFeeNum;
            if (upfrontFeePercentage) {
                upfrontFees = borrowedAmountNum * (upfrontFeeNum / 100)
            }
        }


        const borrowPeriodInterest = calculateCreditCardInterest(borrowedAmountNum, borrowInterestNum, borrowPeriodNum, interestInterval, upfrontFees);

        console.log('borrowPeriodInterest: ', borrowPeriodInterest)


        console.log('borrowedAmountNum: ', borrowedAmountNum)
        console.log('borrowPeriod: ', borrowPeriod)
        // Calculate returns during borrow period
        const borrowPeriodReturns = calculateReturns(borrowedAmountNum, withdrawPeriod);
        console.log('borrowPeriodReturns: ', borrowPeriodReturns)

        // Net returns after repaying borrowed amount
        const netReturns = borrowPeriodReturns - (borrowPeriodInterest.totalInterestPaid + borrowPeriodInterest.feePaid);
        console.log('netReturns: ', netReturns)

        // Calculate potential withdraw amount on net returns
        const initialWithdrawReturns = calculateReturns(netReturns, withdrawPeriod);
        console.log('initialWithdrawReturns: ', initialWithdrawReturns)
        // Calculate potential withdraw amount on net returns
        const withdrawReturns = calculateReturns(netReturns, withdrawPeriod, borrowCompoundMode, BorrowCompoundPeriods);
        console.log('withdrawReturns: ', withdrawReturns)

        const result: BorrowedFundsResult = {
            borrowedAmount: borrowedAmountNum,
            borrowPeriod,
            loan: borrowPeriodInterest,
            withdrawPeriod,
            borrowPeriodReturns,
            netReturns,
            initialWithdrawReturns,
            withdrawReturns,
            totalNetProfit: netReturns
        };

        setBorrowedFundsResult(result);
    };

    const handleReverseBorrowedFundsCalculation = () => {
        const desiredWithdrawAmountNum = parseFloat(desiredWithdrawAmount || '0');
        const borrowInterestNum = parseFloat(reverseBorrowInterest || '0');
        const borrowPeriodNum = parseFloat(reverseBorrowPeriod || '0');
        const interestIntervalNum = InterestInterval[reverseInterestInterval];
        console.log("reverseInterestInterval:", reverseInterestInterval)
        console.log("desiredWithdrawAmountNum:", desiredWithdrawAmountNum)
        console.log("borrowInterestNum:", borrowInterestNum)
        console.log("borrowPeriodNum:", borrowPeriodNum)
        console.log("interestIntervalNum:", interestIntervalNum)

        // Calculate daily interest rate
        const dailyInterestRate = (borrowInterestNum / interestIntervalNum) / 100;
        console.log("dailyInterestRate:", dailyInterestRate)

        // Calculate total interest for the loan period
        const totalInterestRate = dailyInterestRate * borrowPeriodNum;
        console.log("totalInterestRate:", totalInterestRate)

        // Calculate investment rate for the borrow period
        const borrowPeriodRate = RATES[withdrawPeriod2] / 100;
        console.log("borrowPeriodRate:", borrowPeriodRate)

        // Calculate investment rate for the Bitnest Loop
        const withdrawPeriodRate = RATES[withdrawPeriod2] / 100;
        console.log("withdrawPeriodRate:", withdrawPeriodRate)

        // Calculate the required loan amount using the formula:
        // desiredReturn = (loanAmount * borrowPeriodRate) - (loanAmount * totalInterestRate)
        // desiredReturn = loanAmount * (borrowPeriodRate - totalInterestRate)
        // loanAmount = desiredReturn / (borrowPeriodRate - totalInterestRate)
        const IntermediateBorrowedAmountNeeded = desiredWithdrawAmountNum / withdrawPeriodRate;
        console.log("IntermediateBorrowedAmountNeeded:", IntermediateBorrowedAmountNeeded)

        const borrowedAmountNeeded = IntermediateBorrowedAmountNeeded / (borrowPeriodRate - totalInterestRate);

        // Calculate the total interest that will be paid
        const totalInterestPaid = borrowedAmountNeeded * totalInterestRate;
        console.log("totalInterestPaid:", totalInterestPaid)

        // Calculate the returns from investing the borrowed amount
        const investmentReturns = borrowedAmountNeeded * borrowPeriodRate;
        console.log("investmentReturns:", investmentReturns)

        // Calculate net returns after paying interest
        const netReturns = investmentReturns - totalInterestPaid;
        console.log("netReturns:", netReturns)

        // Calculate potential returns from reinvesting the net returns
        const withdrawReturns = netReturns * withdrawPeriodRate;
        console.log("withdrawReturns:", withdrawReturns)

        const result: ReverseBorrowedFundsResult = {
            desiredWithdrawAmount: desiredWithdrawAmountNum,
            borrowPeriod: reverseBorrowPeriod,
            withdrawPeriod: withdrawPeriod2,
            borrowedAmountNeeded,
            netReturnsNeeded: netReturns,
            withdrawReturns: withdrawReturns,
            totalNetProfit: netReturns + withdrawReturns,
            totalFees: totalInterestPaid
        };

        setReverseBorrowedFundsResult(result);
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-white min-h-screen">
            {/* Top Join Button */}

            <Card className="w-full max-w-xl rounded-lg border border-gray-200 shadow-md overflow-hidden">
                <CardHeader className="bg-[#6436C0] text-white p-4">
                    <CardTitle className="text-xl font-bold text-center">BitNest Investment Calculator</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-6 bg-white">
                    <p className="text-center text-lg font-medium text-gray-800 mb-4">
                        Are you ready to unlock the potential of BitNest's passive income opportunity?
                    </p>
                    {inviteCode && (
                        <div className="w-full max-w-xl mb-4">
                            <Button
                                onClick={handleSignup}
                                className="w-full bg-[#FF0000] hover:bg-[#E30B5C] text-white py-6 text-lg font-bold"
                            >
                                Join Bitnest Today!
                            </Button>
                            <div className="text-center space-y-2">
                                <p className="text-sm text-gray-600">
                                    On mobile device - copy this url and paste it in your metamask wallet browser
                                </p>
                                <button
                                    onClick={copySignup}
                                    className="text-[#6436C0] hover:text-[#5328A9] underline text-sm break-all"
                                >
                                    https://bitnest.me/{inviteCode}
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="bg-white p-4 space-y-4 border-b-2 border-gray-300"></div>
                    <p className="text-center text-lg font-medium text-gray-800 mb-4">
                        ↓ Calculate your returns below ↓
                    </p>
                </CardContent>
                <CardContent className="p-4 space-y-6 bg-white">
                    {/* Investment Returns */}
                    <div className="bg-white p-4 space-y-4 border-b-2 border-gray-300">
                        <h3 className="text-lg font-medium text-gray-700">Investment Returns</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="principal" className="text-xs text-gray-600 mb-1 block">Principal Amount</Label>
                                <Input
                                    id="principal"
                                    type="text"
                                    placeholder="Enter investment amount"
                                    value={principal}
                                    onChange={(e) => setPrincipal(e.target.value)}
                                    className="w-full border border-gray-300 rounded"
                                />
                            </div>
                            <div>
                                <Label htmlFor="period" className="text-xs text-gray-600 mb-1 block">Investment Period</Label>
                                <Select value={period} onValueChange={setPeriod}>
                                    <SelectTrigger className="w-full border border-gray-300 rounded">
                                        <SelectValue placeholder="Select period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(RATES).map(([days, rate]) => (
                                            <SelectItem key={days} value={days}>
                                                {days} Days ({rate}%)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="compoundReturns"
                                    checked={compoundMode}
                                    onCheckedChange={(checked) => setCompoundMode(!!checked)}
                                    className="border-gray-300"
                                />
                                <Label htmlFor="compoundReturns" className="text-xs text-gray-600">
                                    Compound Returns
                                </Label>
                            </div>
                            {compoundMode && (
                                <div>
                                    <Label htmlFor="periods" className="text-xs text-gray-600 mb-1 block">Compounding Periods</Label>
                                    <Input
                                        id="periods"
                                        type="string"
                                        placeholder="Enter number of compound periods"
                                        value={compoundPeriods}
                                        onChange={(e) => setCompoundPeriods(e.target.value)}
                                        className="w-full border border-gray-300 rounded"
                                    />
                                </div>
                            )}
                            <Button
                                onClick={handleMainCalculation}
                                className="w-full bg-[#6436C0] hover:bg-[#5328A9] text-white"
                            >
                                Calculate Returns
                            </Button>
                        </div>
                        {investmentResult && (
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h3 className="font-bold text-xl text-gray-800 mb-4">Investment Results</h3>
                                <div className="grid md:grid-cols-3 gap-2">
                                    <p>Principal: <span className="font-semibold text-blue-700">{investmentResult.principal.toFixed(2)}</span> USDT</p>
                                    <p>Period: <span className="font-semibold">{investmentResult.period} Days</span></p>
                                    <p>Compound Mode: <span className="font-semibold">{investmentResult.compoundMode ? 'Yes' : 'No'}</span></p>
                                    <p>Returns: <span className="font-semibold text-green-600">{investmentResult.returns.toFixed(2)}</span> USDT</p>
                                    <p>Total Value: <span className="font-semibold text-blue-700">{investmentResult.totalValue.toFixed(2)}</span> USDT</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Target Return Planning */}
                    <div className="bg-white p-4 space-y-4 border-b-2 border-gray-300">
                        <h3 className="text-lg font-medium text-gray-700">Target Return Planning</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="targetReturn" className="text-xs text-gray-600 mb-1 block">Target Return Amount</Label>
                                <Input
                                    id="targetReturn"
                                    type="text"
                                    placeholder="Enter desired return"
                                    value={targetReturn}
                                    onChange={(e) => setTargetReturn(e.target.value)}
                                    className="w-full border border-gray-300 rounded"
                                />
                            </div>
                            <div>
                                <Label htmlFor="period2" className="text-xs text-gray-600 mb-1 block">Investment Period</Label>
                                <Select value={period} onValueChange={setPeriod}>
                                    <SelectTrigger className="w-full border border-gray-300 rounded">
                                        <SelectValue placeholder="Select period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(RATES).map(([days, rate]) => (
                                            <SelectItem key={days} value={days}>
                                                {days} Days ({rate}%)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={handleTargetReturnCalculation}
                                className="w-full bg-[#6436C0] hover:bg-[#5328A9] text-white"
                            >
                                Calculate Required Investment
                            </Button>
                            {targetReturnResult && (
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h3 className="font-bold text-xl text-gray-800 mb-4">Target Return Results</h3>
                                    <div className="grid md:grid-cols-2 gap-2">
                                        <p>Target Return: <span className="font-semibold text-blue-700">{targetReturnResult.targetReturn.toFixed(2)}</span> USDT</p>
                                        <p>Period: <span className="font-semibold">{targetReturnResult.period} Days</span></p>
                                        <p>Required Principal: <span className="font-semibold text-green-600">{targetReturnResult.requiredPrincipal.toFixed(2)}</span> USDT</p>
                                        <p>Potential Returns: <span className="font-semibold text-blue-700">{targetReturnResult.potentialReturns.toFixed(2)}</span> USDT</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Borrowed Funds Scenario */}
                    <div className="bg-white p-4 space-y-4 border-b-2 border-gray-300">
                        <h3 className="text-lg font-medium text-gray-700">Borrowed Funds Scenario</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="borrowedAmount" className="text-xs text-gray-600 mb-1 block">Borrowed Amount</Label>
                                <Input
                                    id="borrowedAmount"
                                    type="text"
                                    placeholder="Enter borrowed amount"
                                    value={borrowedAmount}
                                    onChange={(e) => setBorrowedAmount(e.target.value)}
                                    className="w-full border border-gray-300 rounded"
                                />
                            </div>
                            <div>
                                <Label htmlFor="borrowPeriod" className="text-xs text-gray-600 mb-1 block">Borrow Period (days)</Label>
                                <Input
                                    id="borrowPeriod"
                                    type="text"
                                    placeholder="Enter borrowed period"
                                    value={borrowPeriod}
                                    onChange={(e) => setBorrowPeriod(e.target.value)}
                                    className="w-full border border-gray-300 rounded"
                                />
                            </div>
                            <div>
                                <Label htmlFor="borrowInterest" className="text-xs text-gray-600 mb-1 block">Borrow Interest Rate %</Label>
                                <Input
                                    id="borrowInterest"
                                    type="text"
                                    placeholder="Enter interest for borrowed funds"
                                    value={borrowInterest}
                                    onChange={(e) => setBorrowInterest(e.target.value)}
                                    className="w-full border border-gray-300 rounded"
                                />
                            </div>
                            <div>
                                <Label htmlFor="interestInterval" className="text-xs text-gray-600 mb-1 block">Interest interval</Label>
                                <Select value={interestInterval} onValueChange={setInterestInterval}>
                                    <SelectTrigger className="w-full border border-gray-300 rounded">
                                        <SelectValue placeholder="Select interest interval" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(InterestInterval).map(([days, rate]) => (
                                            <SelectItem key={days} value={days}>
                                                {days}  ({rate} Days)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="withdrawPeriod" className="text-xs text-gray-600 mb-1 block">Bitnest Loop</Label>
                                <Select value={withdrawPeriod} onValueChange={setWithdrawPeriod}>
                                    <SelectTrigger className="w-full border border-gray-300 rounded">
                                        <SelectValue placeholder="Select Bitnest Loop" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(RATES).map(([days, rate]) => (
                                            <SelectItem key={days} value={days}>
                                                {days} Days ({rate}%)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="useUpfrontFee"
                                    checked={useUpfrontFee}
                                    onCheckedChange={(checked) => setUseUpfrontFee(!!checked)}
                                    className="border-gray-300"
                                />
                                <Label htmlFor="useUpfrontFee" className="text-xs text-gray-600">
                                    Upfront Fee
                                </Label>
                            </div>
                            {useUpfrontFee && (
                                <>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="upfrontFeePercentage"
                                            checked={upfrontFeePercentage}
                                            onCheckedChange={(checked) => setUpfrontFeePercentage(!!checked)}
                                            className="border-gray-300"
                                        />
                                        <Label htmlFor="upfrontFeePercentage" className="text-xs text-gray-600">
                                            Upfront fee is percentage
                                        </Label>
                                    </div>
                                    <div>
                                        <Label htmlFor="upfrontFee" className="text-xs text-gray-600 mb-1 block">Upfront Fee</Label>
                                        <Input
                                            id="upfrontFee"
                                            type="number"
                                            placeholder="Enter upfront fee"
                                            value={upfrontFee}
                                            onChange={(e) => setUpfrontFee(e.target.value)}
                                            className="w-full border border-gray-300 rounded"
                                        />
                                    </div>
                                </>
                            )}
                            {/* <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="borrowCompoundReturns"
                                    checked={borrowCompoundMode}
                                    onCheckedChange={(checked) => setBorrowCompoundMode(!!checked)}
                                    className="border-gray-300"
                                />
                                <Label htmlFor="borrowCompoundReturns" className="text-xs text-gray-600">
                                    Compound Returns
                                </Label>
                            </div> */}
                            {/* {borrowCompoundMode && (
                                <div>
                                    <Label htmlFor="borrowPeriods" className="text-xs text-gray-600 mb-1 block">Compounding Periods</Label>
                                    <Input
                                        id="borrowPeriods"
                                        type="string"
                                        placeholder="Enter number of compound periods"
                                        value={BorrowCompoundPeriods}
                                        onChange={(e) => setBorrowCompoundPeriods(e.target.value)}
                                        className="w-full border border-gray-300 rounded"
                                    />
                                </div>
                            )} */}
                            <Button
                                onClick={handleBorrowedFundsCalculation}
                                className="w-full bg-[#6436C0] hover:bg-[#5328A9] text-white"
                            >
                                Calculate Borrowed Funds Scenario
                            </Button>
                            {borrowedFundsResult && (
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h3 className="font-bold text-xl text-gray-800 mb-4">Borrowed Funds Results</h3>
                                    <div className="grid md:grid-cols-3 gap-2">
                                        <p className="font-bold" >Total Returns (including initial): <span className="font-semibold text-green-600">{(borrowedFundsResult.borrowPeriodReturns + borrowedFundsResult.borrowedAmount).toFixed(2)}</span> USDT</p>
                                        <p className="font-bold text-red-600">Borrowing Cost: <span className="font-semibold">{(borrowedFundsResult.loan.totalInterestPaid + borrowedFundsResult.loan.feePaid).toFixed(4)}</span> USDT</p>
                                        {/* <p>Borrow Interest: <span className="font-semibold">${borrowedFundsResult.loan.totalInterestPaid.toFixed(4)}</span></p> */}
                                        {/* <p>Borrow Period Returns: <span className="font-semibold text-green-600">${borrowedFundsResult.borrowPeriodReturns.toFixed(2)}</span></p> */}
                                        {/* <p>Borrow Interest: <span className="font-semibold">${borrowedFundsResult.loan.totalInterestPaid.toFixed(4)}</span></p> */}
                                        {/* <p>Borrowed Amount: <span className="font-semibold text-blue-700">${borrowedFundsResult.borrowedAmount.toFixed(2)}</span></p>
                                        <p>Borrow Period: <span className="font-semibold">{borrowedFundsResult.borrowPeriod} Days</span></p>
                                        <p>Borrow Interest: <span className="font-semibold">${borrowedFundsResult.loan.totalInterestPaid.toFixed(4)}</span></p> */}
                                        {/* <p>Borrow Repayment Amount: <span className="font-semibold">${borrowedFundsResult.loan.totalAmountOwed.toFixed(4)}</span></p> */}
                                        {/* <p>Borrow Period Returns: <span className="font-semibold text-green-600">${borrowedFundsResult.borrowPeriodReturns.toFixed(2)}</span></p> */}
                                        {/* <p>Return on Borrow: <span className="font-semibold text-blue-700">${borrowedFundsResult.netReturns.toFixed(2)}</span></p> */}
                                        {/* <p>Profit: <span className="font-semibold text-blue-700">${borrowedFundsResult.netReturns.toFixed(2)}</span></p> */}

                                        {/* <p>Bitnest Loop : <span className="font-semibold">{borrowedFundsResult.withdrawPeriod} Days</span></p> */}
                                        {borrowCompoundMode ? (
                                            <>
                                                <p className="font-bold text-blue-600">Withdraw Amount at end of loan: {borrowedFundsResult.initialWithdrawReturns.toFixed(2)} USDT per {borrowedFundsResult.withdrawPeriod} Days</p>
                                                <p className="font-bold text-green-700">Total Net Profit end of loan: {(borrowedFundsResult.netReturns + borrowedFundsResult.initialWithdrawReturns).toFixed(2)} USDT</p>
                                                <p className="font-bold text-green-700">Total Net Profit: {borrowedFundsResult.totalNetProfit.toFixed(2)} USDT</p>
                                            </>
                                        ) : (
                                            <>
                                                {/* <p className="font-bold text-blue-600">Withdraw Amount: ${borrowedFundsResult.withdrawReturns.toFixed(2)} per {borrowedFundsResult.withdrawPeriod} Days</p> */}
                                                <p className="font-bold text-blue-600">Profit: {borrowedFundsResult.totalNetProfit.toFixed(2)} USDT</p>
                                                <p className="font-bold text-green-700">Reinvest Profit Returns: {borrowedFundsResult.withdrawReturns.toFixed(2)} USDT per {borrowedFundsResult.withdrawPeriod} Days</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reverse Borrowed Funds Scenario */}
                    <div className="bg-white p-4 space-y-4">
                        <h3 className="text-lg font-medium text-gray-700">Reverse Borrowed Funds Scenario</h3>
                        <Label htmlFor="reverseDescription" className="text-xs text-gray-600 mb-1 block">Calculate how much you need to borrow in order to make X amount per Period recurring. </Label>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="desiredWithdraw" className="text-xs text-gray-600 mb-1 block">Desired Withdraw Amount Per Bitnest Loop</Label>
                                <Input
                                    id="desiredWithdraw"
                                    type="text"
                                    placeholder="Enter desired withdraw amount"
                                    value={desiredWithdrawAmount}
                                    onChange={(e) => setDesiredWithdrawAmount(e.target.value)}
                                    className="w-full border border-gray-300 rounded"
                                />
                            </div>
                            {/* <div>
                                <Label htmlFor="borrowPeriod2" className="text-xs text-gray-600 mb-1 block">Borrow Period</Label>
                                <Select value={borrowPeriod} onValueChange={setBorrowPeriod}>
                                    <SelectTrigger className="w-full border border-gray-300 rounded">
                                        <SelectValue placeholder="Select borrow period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(RATES).map(([days, rate]) => (
                                            <SelectItem key={days} value={days}>
                                                {days} Days ({rate}%)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div> */}
                            <div>
                                <Label htmlFor="reverseBorrowPeriod" className="text-xs text-gray-600 mb-1 block">Borrow Period (days)</Label>
                                <Input
                                    id="reverseBorrowPeriod"
                                    type="text"
                                    placeholder="Enter borrowed amount"
                                    value={reverseBorrowPeriod}
                                    onChange={(e) => setReverseBorrowPeriod(e.target.value)}
                                    className="w-full border border-gray-300 rounded"
                                />
                            </div>
                            <div>
                                <Label htmlFor="reverseBorrowInterest" className="text-xs text-gray-600 mb-1 block">Borrow Interest Rate %</Label>
                                <Input
                                    id="reverseBorrowInterest"
                                    type="text"
                                    placeholder="Enter interest for borrowed funds"
                                    value={reverseBorrowInterest}
                                    onChange={(e) => setReverseBorrowInterest(e.target.value)}
                                    className="w-full border border-gray-300 rounded"
                                />
                            </div>
                            <div>
                                <Label htmlFor="reverseInterestInterval" className="text-xs text-gray-600 mb-1 block">Interest interval</Label>
                                <Select value={reverseInterestInterval} onValueChange={setReverseInterestInterval}>
                                    <SelectTrigger className="w-full border border-gray-300 rounded">
                                        <SelectValue placeholder="Select interest interval" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(InterestInterval).map(([days, rate]) => (
                                            <SelectItem key={days} value={days}>
                                                {days}  ({rate} Days)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="withdrawPeriod2" className="text-xs text-gray-600 mb-1 block">Bitnest Loop</Label>
                                <Select value={withdrawPeriod2} onValueChange={setWithdrawPeriod2}>
                                    <SelectTrigger className="w-full border border-gray-300 rounded">
                                        <SelectValue placeholder="Select Bitnest Loop" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(RATES).map(([days, rate]) => (
                                            <SelectItem key={days} value={days}>
                                                {days} Days ({rate}%)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={handleReverseBorrowedFundsCalculation}
                                className="w-full bg-[#6436C0] hover:bg-[#5328A9] text-white"
                            >
                                Calculate Required Borrowed Amount
                            </Button>
                            {reverseBorrowedFundsResult && (
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h3 className="font-bold text-xl text-gray-800 mb-4">Reverse Borrowed Funds Results</h3>
                                    <div className="grid md:grid-cols-3 gap-2">
                                        {/* <p>Desired Withdraw Amount: <span className="font-semibold text-blue-700">${reverseBorrowedFundsResult.desiredWithdrawAmount.toFixed(2)} per {reverseBorrowedFundsResult.withdrawPeriod} Days</span></p> */}
                                        {/* <p>Borrow Period: <span className="font-semibold">{reverseBorrowedFundsResult.borrowPeriod} Days</span></p> */}
                                        {/* <p>Bitnest Loop: <span className="font-semibold">{reverseBorrowedFundsResult.withdrawPeriod} Days</span></p> */}
                                        <p className="font-bold" >Required Borrowed Amount: <span className="font-semibold text-green-600">{reverseBorrowedFundsResult.borrowedAmountNeeded.toFixed(2)}</span> USDT</p>
                                        <p className="font-bold text-red-600">Borrowing Cost: <span className="font-semibold">{(reverseBorrowedFundsResult.totalFees).toFixed(4)}</span> USDT</p>
                                        <p className="font-bold text-blue-600">Net Profit Generated: <span className="font-semibold text-blue-700">{reverseBorrowedFundsResult.netReturnsNeeded.toFixed(2)}</span> USDT</p>
                                        <p className="font-bold text-green-700">Reinvest Profit Returns: {reverseBorrowedFundsResult.withdrawReturns.toFixed(2)} USDT per {reverseBorrowedFundsResult.withdrawPeriod} Days</p>
                                        {/* <p className="font-bold text-green-700">Total Net Profit: ${reverseBorrowedFundsResult.totalNetProfit.toFixed(2)}</p> */}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bottom Join Button and Mobile Instructions */}
            {inviteCode && (
                <div className="w-full max-w-xl mt-4 space-y-4">
                    <Button
                        onClick={handleSignup}
                        className="w-full bg-[#FF0000] hover:bg-[#E30B5C] text-white py-6 text-lg font-bold"
                    >
                        Join Bitnest Today!
                    </Button>

                    <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">
                            On mobile device - copy this url and paste it in your metamask wallet browser
                        </p>
                        <button
                            onClick={copySignup}
                            className="text-[#6436C0] hover:text-[#5328A9] underline text-sm break-all"
                        >
                            https://bitnest.me/{inviteCode}
                        </button>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {showToast && (
                <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg ${toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } text-white transition-opacity duration-300`}>
                    {toastMessage}
                </div>
            )}
        </div>
    );
};
