import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import EditBook from "@/pages/EditBook";
import Toast from "@/components/Toast";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/edit/:secretId" component={EditBook} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
      <Toast />
    </QueryClientProvider>
  );
}

export default App;
