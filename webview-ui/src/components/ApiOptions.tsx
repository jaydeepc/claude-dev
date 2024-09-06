import React, { useMemo } from "react"
import {
	ApiConfiguration,
	ModelInfo,
	anthropicModels,
} from "../../../src/shared/api"

interface ApiOptionsProps {
	apiConfiguration?: ApiConfiguration
	setApiConfiguration: React.Dispatch<React.SetStateAction<ApiConfiguration | undefined>>
	showModelOptions: boolean
}

const ApiOptions: React.FC<ApiOptionsProps> = ({ apiConfiguration, setApiConfiguration, showModelOptions }) => {
	const { selectedModelInfo } = useMemo(() => {
		return normalizeApiConfiguration(apiConfiguration)
	}, [apiConfiguration])

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
			{showModelOptions && <ModelInfoView modelInfo={selectedModelInfo} />}
		</div>
	)
}

const ModelInfoView = ({ modelInfo }: { modelInfo: ModelInfo }) => {
	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(price)
	}

	return (
		<p style={{ fontSize: "12px", marginTop: "2px", color: "var(--vscode-descriptionForeground)" }}>
			<ModelInfoSupportsItem
				isSupported={modelInfo.supportsImages}
				supportsLabel="Supports images"
				doesNotSupportLabel="Does not support images"
			/>
			<br />
			<ModelInfoSupportsItem
				isSupported={modelInfo.supportsPromptCache}
				supportsLabel="Supports prompt caching"
				doesNotSupportLabel="Does not support prompt caching"
			/>
			<br />
			<span style={{ fontWeight: 500 }}>Max output:</span> {modelInfo?.maxTokens?.toLocaleString()} tokens
			<br />
			<span style={{ fontWeight: 500 }}>Input price:</span> {formatPrice(modelInfo.inputPrice)}/million tokens
			{modelInfo.supportsPromptCache && modelInfo.cacheWritesPrice && modelInfo.cacheReadsPrice && (
				<>
					<br />
					<span style={{ fontWeight: 500 }}>Cache writes price:</span>{" "}
					{formatPrice(modelInfo.cacheWritesPrice || 0)}/million tokens
					<br />
					<span style={{ fontWeight: 500 }}>Cache reads price:</span>{" "}
					{formatPrice(modelInfo.cacheReadsPrice || 0)}/million tokens
				</>
			)}
			<br />
			<span style={{ fontWeight: 500 }}>Output price:</span> {formatPrice(modelInfo.outputPrice)}/million tokens
		</p>
	)
}

const ModelInfoSupportsItem = ({
	isSupported,
	supportsLabel,
	doesNotSupportLabel,
}: {
	isSupported: boolean
	supportsLabel: string
	doesNotSupportLabel: string
}) => (
	<span
		style={{
			fontWeight: 500,
			color: isSupported ? "var(--vscode-testing-iconPassed)" : "var(--vscode-errorForeground)",
		}}>
		<i
			className={`codicon codicon-${isSupported ? "check" : "x"}`}
			style={{
				marginRight: 4,
				marginBottom: isSupported ? 1 : -1,
				fontSize: isSupported ? 11 : 13,
				fontWeight: 700,
				display: "inline-block",
				verticalAlign: "bottom",
			}}></i>
		{isSupported ? supportsLabel : doesNotSupportLabel}
	</span>
)

export function normalizeApiConfiguration(apiConfiguration?: ApiConfiguration) {
	const provider = "anthropic"
	const modelId = "claude-3-5-sonnet-20240620"

	const selectedModelInfo = anthropicModels[modelId]

	return { selectedProvider: provider, selectedModelId: modelId, selectedModelInfo }
}

export default ApiOptions
