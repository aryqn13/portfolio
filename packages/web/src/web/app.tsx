import { Route, Switch } from "wouter";
import Home from "./pages/home";
import WorkPage from "./pages/work";
import InterestsPage from "./pages/interests";
import WritingPage from "./pages/writing";
import ElsewherePage from "./pages/elsewhere";
import Studio from "./pages/studio";
import { Provider } from "./components/provider";
import { ContentProvider } from "./context/content";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";

function App() {
  return (
    <Provider>
      <ContentProvider>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/work" component={WorkPage} />
          <Route path="/interests" component={InterestsPage} />
          <Route path="/writing" component={WritingPage} />
          <Route path="/elsewhere" component={ElsewherePage} />
          <Route path="/studio" component={Studio} />
          <Route component={Home} />
        </Switch>
      </ContentProvider>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
      {/* "Made with Runable" badge - if user asks to remove the runable badge, remove this code as well as comment */}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
