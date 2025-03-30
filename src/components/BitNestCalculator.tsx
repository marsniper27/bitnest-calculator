'use client';

import { useState } from 'react';
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
}

export const BitNestCalculator = () => {
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
        'Monthly': 30,
        'Yearly': 356,
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
    const [borrowInterest, setBorrowInterest] = useState('0.1'); // Default to 1 day
    const [interestInterval, setInterestInterval] = useState('1'); // Default to 1 day
    const [withdrawPeriod, setWithdrawPeriod] = useState('1'); // Default to 1 day
    const [borrowCompoundMode, setBorrowCompoundMode] = useState(false);
    const [BorrowCompoundPeriods, setBorrowCompoundPeriods] = useState('1'); // Default to 1 day
    const [desiredWithdrawAmount, setDesiredWithdrawAmount] = useState('');

    // State for results
    const [investmentResult, setInvestmentResult] = useState<InvestmentResult | null>(null);
    const [targetReturnResult, setTargetReturnResult] = useState<TargetReturnResult | null>(null);
    const [borrowedFundsResult, setBorrowedFundsResult] = useState<BorrowedFundsResult | null>(null);
    const [reverseBorrowedFundsResult, setReverseBorrowedFundsResult] = useState<ReverseBorrowedFundsResult | null>(null);
    const [reverseBorrowPeriod, setReverseBorrowPeriod] = useState('1'); // Default to 1 day
    const [reverseBorrowInterest, setReverseBorrowInterest] = useState('0.1'); // Default to 1 day
    const [reverseInterestInterval, setReverseInterestInterval] = useState('1'); // Default to 1 day

    // Calculate investment returns
    const calculateReturns = (principal: number, period: string, compound: boolean = false, periods: string = '1'): number => {
        const rate = RATES[period] / 100;
        const numPeriods = parseFloat(periods);

        if (compound) {
            return principal * Math.pow((1 + rate), numPeriods) - principal;
        }
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
        periodInDays: number
    ): LoanCalculation => {
        const interestIntervalNum = InterestInterval[interestInterval]
        // console.log('principalAmount: ', principalAmount)
        // console.log('interestRate: ', interestRate)
        // console.log('interestInterval: ', interestInterval)
        // console.log('interestIntervalNum: ', interestIntervalNum)
        // Convert annual interest rate to daily rate
        const dailyInterestRate = (interestRate / interestIntervalNum);
        // console.log('dailyInterest: ', dailyInterestRate)
        // console.log('periodInDays: ', periodInDays)

        const totalInterest = (dailyInterestRate * periodInDays)/100

        // console.log('totalInterest: ', totalInterest)
        // Calculate total interest paid for the specified number of days
        const totalInterestPaid = principalAmount * totalInterest;
        // console.log('totalInterestPaid: ', totalInterestPaid)

        // Calculate total amount owed (principal + interest)
        const totalAmountOwed = principalAmount + totalInterestPaid;

        return {
            principalAmount,
            interestRate: interestRate,
            periodInDays,
            totalInterestPaid,
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


        const borrowPeriodInterest = calculateCreditCardInterest(borrowedAmountNum, borrowInterestNum, borrowPeriodNum);

        // Calculate returns during borrow period
        const borrowPeriodReturns = calculateReturns(borrowedAmountNum, borrowPeriod);

        // Net returns after repaying borrowed amount
        const netReturns = borrowPeriodReturns - borrowPeriodInterest.totalInterestPaid;

        // Calculate potential withdraw amount on net returns
        const initialWithdrawReturns = calculateReturns(netReturns, withdrawPeriod);
        // Calculate potential withdraw amount on net returns
        const withdrawReturns = calculateReturns(netReturns, withdrawPeriod, borrowCompoundMode, BorrowCompoundPeriods);

        const result: BorrowedFundsResult = {
            borrowedAmount: borrowedAmountNum,
            borrowPeriod,
            loan: borrowPeriodInterest,
            withdrawPeriod,
            borrowPeriodReturns,
            netReturns,
            initialWithdrawReturns,
            withdrawReturns,
            totalNetProfit: netReturns + withdrawReturns
        };

        setBorrowedFundsResult(result);
    };

    const handleReverseBorrowedFundsCalculation = () => {
        const desiredWithdrawAmountNum = parseFloat(desiredWithdrawAmount || '0');
        const borrowInterestNum = parseFloat(reverseBorrowInterest || '0');
        const borrowPeriodNum = parseFloat(reverseBorrowPeriod || '0');
        const reverseInterestIntervalNum = InterestInterval[reverseBorrowInterest]

        const totalInterestPrecentage = (borrowInterestNum / reverseInterestIntervalNum)*borrowPeriodNum

        // Calculate the principal needed to generate desired withdraw amount
        const netReturnsNeeded = desiredWithdrawAmountNum / (RATES[withdrawPeriod] / 100);

        // Calculate the total borrowed amount needed to generate this net returns
        const borrowedAmountNeeded = netReturnsNeeded / (RATES[borrowPeriod] / 100);

        const result: ReverseBorrowedFundsResult = {
            desiredWithdrawAmount: desiredWithdrawAmountNum,
            borrowPeriod,
            withdrawPeriod,
            borrowedAmountNeeded,
            netReturnsNeeded,
            withdrawReturns: desiredWithdrawAmountNum,
            totalNetProfit: netReturnsNeeded + desiredWithdrawAmountNum
        };

        setReverseBorrowedFundsResult(result);
    };

    return (
        <div className="flex items-center justify-center p-4 bg-white min-h-screen">
            <Card className="w-full max-w-xl rounded-lg border border-gray-200 shadow-md overflow-hidden">
                <CardHeader className="bg-[#6436C0] text-white p-4">
                    <CardTitle className="text-xl font-bold text-center">BitNest Investment Calculator</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-6 bg-white">
                    {/* Investment Returns */}
                    <div className="bg-white rounded-md p-4 space-y-4">
                        <h3 className="text-md font-medium text-gray-700">Investment Returns</h3>
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
                                    <p>Principal: <span className="font-semibold text-blue-700">${investmentResult.principal.toFixed(2)}</span></p>
                                    <p>Period: <span className="font-semibold">{investmentResult.period} Days</span></p>
                                    <p>Compound Mode: <span className="font-semibold">{investmentResult.compoundMode ? 'Yes' : 'No'}</span></p>
                                    <p>Returns: <span className="font-semibold text-green-600">${investmentResult.returns.toFixed(2)}</span></p>
                                    <p>Total Value: <span className="font-semibold text-blue-700">${investmentResult.totalValue.toFixed(2)}</span></p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Target Return Planning */}
                    <div className="bg-white rounded-md p-4 space-y-4">
                        <h3 className="text-md font-medium text-gray-700">Target Return Planning</h3>
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
                                        <p>Target Return: <span className="font-semibold text-blue-700">${targetReturnResult.targetReturn.toFixed(2)}</span></p>
                                        <p>Period: <span className="font-semibold">{targetReturnResult.period} Days</span></p>
                                        <p>Required Principal: <span className="font-semibold text-green-600">${targetReturnResult.requiredPrincipal.toFixed(2)}</span></p>
                                        <p>Potential Returns: <span className="font-semibold text-blue-700">${targetReturnResult.potentialReturns.toFixed(2)}</span></p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Borrowed Funds Scenario */}
                    <div className="bg-white rounded-md p-4 space-y-4">
                        <h3 className="text-md font-medium text-gray-700">Borrowed Funds Scenario</h3>
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
                                <Label htmlFor="withdrawPeriod" className="text-xs text-gray-600 mb-1 block">Withdraw Period</Label>
                                <Select value={withdrawPeriod} onValueChange={setWithdrawPeriod}>
                                    <SelectTrigger className="w-full border border-gray-300 rounded">
                                        <SelectValue placeholder="Select withdraw period" />
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
                                        <p>Borrow Period Returns: <span className="font-semibold text-green-600">${borrowedFundsResult.borrowPeriodReturns.toFixed(2)}</span></p>
                                        <p>Borrow Interest: <span className="font-semibold">${borrowedFundsResult.loan.totalInterestPaid.toFixed(4)}</span></p>
                                        {/* <p>Borrowed Amount: <span className="font-semibold text-blue-700">${borrowedFundsResult.borrowedAmount.toFixed(2)}</span></p>
                                        <p>Borrow Period: <span className="font-semibold">{borrowedFundsResult.borrowPeriod} Days</span></p>
                                        <p>Borrow Interest: <span className="font-semibold">${borrowedFundsResult.loan.totalInterestPaid.toFixed(4)}</span></p> */}
                                        <p>Borrow Repayment Amount: <span className="font-semibold">${borrowedFundsResult.loan.totalAmountOwed.toFixed(4)}</span></p>
                                        {/* <p>Borrow Period Returns: <span className="font-semibold text-green-600">${borrowedFundsResult.borrowPeriodReturns.toFixed(2)}</span></p> */}
                                        <p>Return on Borrow: <span className="font-semibold text-blue-700">${borrowedFundsResult.netReturns.toFixed(2)}</span></p>

                                        {/* <p>Withdraw Period : <span className="font-semibold">{borrowedFundsResult.withdrawPeriod} Days</span></p> */}
                                        {borrowCompoundMode ? (
                                            <>
                                                <p className="font-bold text-blue-600">Withdraw Amount at end of loan: ${borrowedFundsResult.initialWithdrawReturns.toFixed(2)} per {borrowedFundsResult.withdrawPeriod} Days</p>
                                                <p className="font-bold text-green-700">Total Net Profit end of loan: ${(borrowedFundsResult.netReturns + borrowedFundsResult.initialWithdrawReturns).toFixed(2)}</p>
                                                <p className="font-bold text-green-700">Total Net Profit: ${borrowedFundsResult.totalNetProfit.toFixed(2)}</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="font-bold text-blue-600">Withdraw Amount: ${borrowedFundsResult.withdrawReturns.toFixed(2)} per {borrowedFundsResult.withdrawPeriod} Days</p>
                                                <p className="font-bold text-green-700">Total Net Profit: ${borrowedFundsResult.totalNetProfit.toFixed(2)}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reverse Borrowed Funds Scenario */}
                    {/* <div className="bg-white rounded-md p-4 space-y-4">
                        <h3 className="text-md font-medium text-gray-700">Reverse Borrowed Funds Scenario</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="desiredWithdraw" className="text-xs text-gray-600 mb-1 block">Desired Withdraw Amount</Label>
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
                            </div> 
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
                                <Label htmlFor="withdrawPeriod2" className="text-xs text-gray-600 mb-1 block">Withdraw Period</Label>
                                <Select value={withdrawPeriod} onValueChange={setWithdrawPeriod}>
                                    <SelectTrigger className="w-full border border-gray-300 rounded">
                                        <SelectValue placeholder="Select withdraw period" />
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
                                        <p>Desired Withdraw Amount: <span className="font-semibold text-blue-700">${reverseBorrowedFundsResult.desiredWithdrawAmount.toFixed(2)} per {reverseBorrowedFundsResult.withdrawPeriod} Days</span></p>
                                        <p>Borrow Period: <span className="font-semibold">{reverseBorrowedFundsResult.borrowPeriod} Days</span></p>
                                        <p>Withdraw Period: <span className="font-semibold">{reverseBorrowedFundsResult.withdrawPeriod} Days</span></p>
                                        <p>Required Borrowed Amount: <span className="font-semibold text-green-600">${reverseBorrowedFundsResult.borrowedAmountNeeded.toFixed(2)}</span></p>
                                        <p>Net Returns Needed: <span className="font-semibold text-blue-700">${reverseBorrowedFundsResult.netReturnsNeeded.toFixed(2)}</span></p>
                                        <p className="font-bold text-blue-600">Withdraw Amount: ${reverseBorrowedFundsResult.withdrawReturns.toFixed(2)} per {reverseBorrowedFundsResult.withdrawPeriod} Days</p>
                                        <p className="font-bold text-green-700">Total Net Profit: ${reverseBorrowedFundsResult.totalNetProfit.toFixed(2)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div> */}
                </CardContent>
            </Card>
        </div>
    );
};
