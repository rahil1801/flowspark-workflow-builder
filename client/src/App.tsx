import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import CreateWorkflow from "@/pages/CreateWorkflow";
import RunWorkflow from "@/pages/RunWorkflow";
import History from "@/pages/History";
import Status from "@/pages/Status";
import Workflows from "@/pages/Workflows";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/workflows" component={Workflows} />
      <Route path="/workflows/new" component={CreateWorkflow} />
      <Route path="/run" component={RunWorkflow} />
      <Route path="/history" component={History} />
      <Route path="/status" component={Status} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
