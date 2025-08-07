import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import UpgradePage from "@/pages/upgrade";
import PaymentSuccess from "@/pages/payment-success";
import TestPlans from "@/pages/test-plans";
import BookMeeting from "@/pages/book-meeting";
import CancelSubscription from "@/pages/cancel-subscription";
import SuccessFreeMonthly from "@/pages/success-free-monthly";
import SuccessStarterMonthly from "@/pages/success-starter-monthly";
import SuccessStarterYearly from "@/pages/success-starter-yearly";
import SuccessProMonthly from "@/pages/success-pro-monthly";
import SuccessProYearly from "@/pages/success-pro-yearly";
import SuccessGrowthMonthly from "@/pages/success-growth-monthly";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/signup" component={Landing} />
          <Route path="/register" component={Landing} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard/*" component={Dashboard} />
          <Route path="/upgrade" component={UpgradePage} />
          <Route path="/payment-success" component={PaymentSuccess} />
          <Route path="/test-plans" component={TestPlans} />
          <Route path="/book-meeting" component={BookMeeting} />
          <Route path="/cancel-subscription" component={CancelSubscription} />
          <Route path="/success/free-monthly" component={SuccessFreeMonthly} />
          <Route path="/success/starter-monthly" component={SuccessStarterMonthly} />
          <Route path="/success/starter-yearly" component={SuccessStarterYearly} />
          <Route path="/success/pro-monthly" component={SuccessProMonthly} />
          <Route path="/success/pro-yearly" component={SuccessProYearly} />
          <Route path="/success/growth-monthly" component={SuccessGrowthMonthly} />
        </>
      )}
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
