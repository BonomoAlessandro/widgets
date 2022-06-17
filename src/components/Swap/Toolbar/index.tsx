import { ALL_SUPPORTED_CHAIN_IDS } from 'constants/chains'
import useActiveWeb3React from 'hooks/connectWeb3/useActiveWeb3React'
import { useIsAmountPopulated, useSwapInfo } from 'hooks/swap'
import useWrapCallback, { WrapType } from 'hooks/swap/useWrapCallback'
import { largeIconCss } from 'icons'
import { memo, useMemo } from 'react'
import { TradeState } from 'state/routing/types'
import { Field } from 'state/swap'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import Row from '../../Row'
import * as Caption from './Caption'

const ToolbarRow = styled(Row)`
  padding: 0.5em 0;
  ${largeIconCss}
`

export default memo(function Toolbar() {
  const { account, activeWallet, activatingWallet, activeNetwork, activatingNetwork, chainId } = useActiveWeb3React()
  const {
    [Field.INPUT]: { currency: inputCurrency, balance: inputBalance, amount: inputAmount },
    [Field.OUTPUT]: { currency: outputCurrency, usdc: outputUSDC },
    trade: { trade, state },
    impact,
  } = useSwapInfo()
  const isAmountPopulated = useIsAmountPopulated()
  const { type: wrapType } = useWrapCallback()
  const activating = activatingWallet || activatingNetwork
  const caption = useMemo(() => {
    if (activating) return <Caption.Connecting />

    // fixme(kristiehuang): activeWallet is not the same as Boolean(account)... why?
    if (!Boolean(account) || !chainId) {
      return <Caption.ConnectWallet />
    }

    if (!ALL_SUPPORTED_CHAIN_IDS.includes(chainId)) {
      return <Caption.UnsupportedNetwork />
    }

    if (inputCurrency && outputCurrency && isAmountPopulated) {
      if (state === TradeState.SYNCING || state === TradeState.LOADING) {
        return <Caption.LoadingTrade />
      }
      if (inputBalance && inputAmount?.greaterThan(inputBalance)) {
        return <Caption.InsufficientBalance currency={inputCurrency} />
      }
      if (wrapType !== WrapType.NONE) {
        return <Caption.WrapCurrency inputCurrency={inputCurrency} outputCurrency={outputCurrency} />
      }
      if (state === TradeState.NO_ROUTE_FOUND || (trade && !trade.swaps)) {
        return <Caption.InsufficientLiquidity />
      }
      if (trade?.inputAmount && trade.outputAmount) {
        return <Caption.Trade trade={trade} outputUSDC={outputUSDC} impact={impact} />
      }
      if (state === TradeState.INVALID) {
        return <Caption.Error />
      }
    }

    return <Caption.Empty />
  }, [
    activating,
    activeWallet,
    chainId,
    impact,
    inputAmount,
    inputBalance,
    inputCurrency,
    isAmountPopulated,
    outputCurrency,
    outputUSDC,
    state,
    trade,
    wrapType,
  ])

  return (
    <ThemedText.Caption data-testid="toolbar">
      <ToolbarRow justify="flex-start" gap={0.5} iconSize={4 / 3}>
        {caption}
      </ToolbarRow>
    </ThemedText.Caption>
  )
})
