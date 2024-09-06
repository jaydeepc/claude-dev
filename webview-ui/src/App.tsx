import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useEvent } from "react-use"
import { ApiConfiguration } from "../../src/shared/api"
import { ClaudeMessage, ExtensionMessage } from "../../src/shared/ExtensionMessage"
import "./App.css"
import { normalizeApiConfiguration } from "./components/ApiOptions"
import ChatView from "./components/ChatView"
import WelcomeView from "./components/WelcomeView"
import { vscode } from "./utils/vscode"
import AutomationSetupView from "./components/AutomationSetupView"

const App: React.FC = () => {
	const [didHydrateState, setDidHydrateState] = useState(false)
	const [showWelcome, setShowWelcome] = useState<boolean>(false)
	const [showAutomationSetup, setShowAutomationSetup] = useState<boolean>(true)
	const [showChatView, setShowChatView] = useState<boolean>(false)
	const [version, setVersion] = useState<string>("")
	const [apiConfiguration, setApiConfiguration] = useState<ApiConfiguration>({
		apiProvider: "anthropic",
		apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY || "",
		apiModelId: "claude-3-5-sonnet-20240620",
		usePromptCache: true
	})
	const [vscodeThemeName, setVscodeThemeName] = useState<string | undefined>(undefined)
	const [claudeMessages, setClaudeMessages] = useState<ClaudeMessage[]>([])

	useEffect(() => {
		vscode.postMessage({ type: "webviewDidLaunch" })
	}, [])

	const handleMessage = useCallback((e: MessageEvent) => {
		const message: ExtensionMessage = e.data
		switch (message.type) {
			case "state":
				setVersion(message.state!.version)
				const hasKey = true // Always consider the key as set
				setShowWelcome(!hasKey)
				setVscodeThemeName(message.state!.themeName)
				setClaudeMessages(message.state!.claudeMessages)
				setDidHydrateState(true)
				break
			case "action":
				switch (message.action!) {
					case "chatButtonTapped":
						setShowAutomationSetup(true)
						setShowChatView(false)
						break
				}
				break
		}
	}, [])

	useEvent("message", handleMessage)

	const { selectedModelInfo } = useMemo(() => {
		return normalizeApiConfiguration(apiConfiguration)
	}, [apiConfiguration])

	const handleStartAutomation = () => {
		setShowAutomationSetup(false)
		setShowChatView(true)
	}

	if (!didHydrateState) {
		return null
	}

	return (
		<div style={{ height: '100vh', overflow: 'auto', backgroundColor: '#1e1e1e', color: '#ffffff' }}>
			{showWelcome ? (
				<WelcomeView
					apiConfiguration={apiConfiguration}
					setApiConfiguration={setApiConfiguration as React.Dispatch<React.SetStateAction<ApiConfiguration | undefined>>}
				/>
			) : (
				<>
					{showAutomationSetup && (
						<AutomationSetupView onStartAutomation={handleStartAutomation} />
					)}
					{showChatView && (
						<ChatView
							version={version}
							messages={claudeMessages}
							isHidden={false}
							vscodeThemeName={vscodeThemeName}
							selectedModelSupportsImages={selectedModelInfo.supportsImages}
							selectedModelSupportsPromptCache={selectedModelInfo.supportsPromptCache}
						/>
					)}
				</>
			)}
		</div>
	)
}

export default App
