import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { Lending } from "../../generated/Lending/Lending";

export function fetchRepaymentAmount(
    _address: Address,
    _amount: BigInt,
    _paidAmount: BigInt,
    _interestRate: BigInt,
    _duration: BigInt,
    _currentTime: BigInt,
    _startTime: BigInt
): BigInt {
    let lending = Lending.bind(_address);
    let protocolfee = lending.protocolFee();
    let _leftAmount = _amount.minus(_paidAmount);
    let originationFee = lending.getOriginationFee(_amount, _leftAmount);
    let repayment = originationFee.plus(
        _leftAmount.plus(
            lending.getDebtWithPenalty(
                _leftAmount,
                _interestRate.plus(protocolfee),
                _startTime.equals(BigInt.zero())
                    ? _duration
                    : _duration.minus(
                        _currentTime.minus(_startTime) > _duration
                            ? _duration
                            : _currentTime.minus(_startTime)
                    ),
                _startTime.equals(BigInt.zero())
                    ? _duration
                    : _duration.minus(
                        _currentTime.minus(_startTime) > _duration
                            ? _duration
                            : _currentTime.minus(_startTime)
                    )
            )
        )
    );
    return repayment;
}
