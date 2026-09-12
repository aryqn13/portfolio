import { Suspense, lazy } from "react";
import { Route, Switch } from "wouter";
import Home from "./pages/home";
import AboutPage from "./pages/about";
import WorkPage from "./pages/work";
import InterestsPage from "./pages/interests";
import WritingPage from "./pages/writing";
import ElsewherePage from "./pages/elsewhere";
// The studio is owner only, and it drags in four editors, a JSON textarea stack
// and the upload flow. Nobody visiting the site should pay for it in the first
// bundle, so it is the one route that is split out.
const Studio = lazy(() => import("./pages/studio"));
import { Provider } from "./components/provider";
import { ContentProvider } from "./context/content";
import { ScrollTop } from "./components/scroll-top";
import { DitherTransition } from "./components/dither/dither-transition";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";

// The dither used to be mounted here, as one fixed field behind the entire
// site. It is now a bounded plate on each page's opening block instead, in
// components/dither/dither-panel.tsx, mounted by Hero and PageShell, PLUS a
// third mount here: DitherTransition intercepts every internal link and
// plays the same field as a sweeping wipe that performs the actual page
// change, so the material is not just something you look at on arrival, it
// is what carries you from one page to the next. See that file for how.

function App() {
  return (
    <Provider>
      <ContentProvider>
        <ScrollTop />
        <DitherTransition />
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={AboutPage} />
          <Route path="/work" component={WorkPage} />
          <Route path="/interests" component={InterestsPage} />
          <Route path="/writing" component={WritingPage} />
          <Route path="/elsewhere" component={ElsewherePage} />
          <Route path="/studio">
            <Suspense fallback={null}>
              <Studio />
            </Suspense>
          </Route>
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
