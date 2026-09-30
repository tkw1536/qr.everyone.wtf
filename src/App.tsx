import * as React from 'react'
import '@fontsource/roboto'
import './styles/footer.css'

import useMediaQuery from '@mui/material/useMediaQuery'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import Home from './pages/index'

export default function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const theme = React.useMemo(
    () => createTheme({
      palette: {
        mode: prefersDarkMode ? 'dark' : 'light',
      },
    }),
    [prefersDarkMode],
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Home />
      <footer>
        <ClientSideScript
          src="https://inform.everyone.wtf/legal.min.js"
          data-site-id={import.meta.env.VITE_TRACKING_ID}
        />
      </footer>
    </ThemeProvider>
  )
}

interface ScriptBasedContentProps {
  src: string
  [key: string]: string
}

/**
 * ClientSideScript ensures that a script is only run client-side.
 * Performs no property escaping what-so-ever, and should only be run on trusted data!
 *
 * It runs inside of a <p> Element.
 */
class ClientSideScript extends React.Component<ScriptBasedContentProps> {
  static asHTML(props: ScriptBasedContentProps) {
    const attributes = Object.entries(props)
      .filter(([, value]) => typeof value === 'string')
      .map(([key, value]) => `${key}="${value}"`).join(' ')
    return `<script ${attributes}></script>`
  }

  override render() {
    // See https://github.com/facebook/react/issues/10923#issuecomment-338715787
    // We are setting the content via dangerouslySetInnerHTML to prevent client-side overrides!
    const html = ClientSideScript.asHTML(this.props)
    return <p dangerouslySetInnerHTML={{ __html: html }}></p>
  }
}
