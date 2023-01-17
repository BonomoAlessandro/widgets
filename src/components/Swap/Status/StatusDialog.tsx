import { Trans } from '@lingui/macro'
import ErrorDialog, { StatusHeader } from 'components/Error/ErrorDialog'
import EtherscanLink from 'components/EtherscanLink'
import Row from 'components/Row'
import SwapSummary from 'components/Swap/Summary'
import { LargeCheck, LargeSpinner } from 'icons'
import { useMemo } from 'react'
import { Transaction, TransactionType } from 'state/transactions'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { ExplorerDataType } from 'utils/getExplorerLink'

import ActionButton from '../../ActionButton'
import Column from '../../Column'

const EtherscanLinkContainer = styled(Row)`
  padding: 0.75em 0 1.5em;
  transition: opacity 0.25s;
  width: 100%;
  :hover {
    opacity: 0.6;
  }
`

interface TransactionStatusProps {
  tx: Transaction
  onClose: () => void
}

function TransactionStatus({ tx, onClose }: TransactionStatusProps) {
  const Icon = useMemo(() => {
    return tx.receipt?.status ? LargeCheck : LargeSpinner
  }, [tx.receipt?.status])
  const heading = useMemo(() => {
    if (tx.info.type === TransactionType.SWAP) {
      return tx.receipt?.status ? <Trans>Success</Trans> : <Trans>Swap pending</Trans>
    } else if (tx.info.type === TransactionType.WRAP) {
      return tx.receipt?.status ? <Trans>Success</Trans> : <Trans>Unwrap pending</Trans>
    } else if (tx.info.type === TransactionType.UNWRAP) {
      return tx.receipt?.status ? <Trans>Success</Trans> : <Trans>Unwrap pending</Trans>
    }
    return tx.receipt?.status ? <Trans>Success</Trans> : <Trans>Transaction pending</Trans>
  }, [tx.info, tx.receipt?.status])

  const subheading = useMemo(() => {
    if (tx.receipt?.status) {
      return <Trans>Your transaction was successful</Trans>
    }
    return null
  }, [tx.receipt?.status])

  return (
    <Column flex padded gap={0.75} align="stretch" style={{ height: '100%' }}>
      <StatusHeader icon={Icon} iconColor={tx.receipt?.status ? 'success' : undefined}>
        <ThemedText.H4>{heading}</ThemedText.H4>
        {tx.info.type === TransactionType.SWAP ? (
          <SwapSummary input={tx.info.trade.inputAmount} output={tx.info.trade.outputAmount} />
        ) : null}
        <ThemedText.Subhead1>{subheading}</ThemedText.Subhead1>
      </StatusHeader>
      <ActionButton onClick={onClose}>
        <Trans>Close</Trans>
      </ActionButton>
      <EtherscanLinkContainer flex justify="center">
        <EtherscanLink type={ExplorerDataType.TRANSACTION} data={tx.info.response.hash} showIcon={false}>
          <ThemedText.ButtonLarge color="active">
            <Trans>View on Etherscan</Trans>
          </ThemedText.ButtonLarge>
        </EtherscanLink>
      </EtherscanLinkContainer>
    </Column>
  )
}

export default function TransactionStatusDialog({ tx, onClose }: TransactionStatusProps) {
  return tx.receipt?.status === 0 ? (
    <ErrorDialog
      header={
        <Trans>
          Try increasing your slippage tolerance.
          <br />
          NOTE: Fee on transfer and rebase tokens are incompatible with Uniswap V3.
        </Trans>
      }
      error={new Error('TODO(zzmp)')}
      action={<Trans>Dismiss</Trans>}
      onClick={onClose}
    />
  ) : (
    <TransactionStatus tx={tx} onClose={onClose} />
  )
}
