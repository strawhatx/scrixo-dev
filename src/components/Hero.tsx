import { motion } from "framer-motion";
import { Upload, FileText, PenLine, Download, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: FileText,
    title: "Edit PDF Text",
    description: "Modify any text in your PDF documents. Unlimited free edits.",
    free: true,
  },
  {
    icon: PenLine,
    title: "Sign PDFs",
    description: "Draw or type your signature. 1 free signature included.",
    free: "1 free",
  },
  {
    icon: Download,
    title: "Download Instantly",
    description: "Get your edited PDF immediately. No watermarks.",
    free: true,
  },
];

const proFeatures = [
  "Unlimited signatures",
  "Merge multiple PDFs",
  "Split PDF pages",
  "Fill forms",
  "No ads",
];

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-background" />
      
      {/* Floating shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="relative container mx-auto px-4 pt-20 pb-32">
        {/* Header */}
        <nav className="flex items-center justify-between mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center shadow-glow">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">PDFOtter</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button variant="hero" size="lg" onClick={() => navigate("/editor")}>
              Start Free
            </Button>
          </motion.div>
        </nav>

        {/* Hero Content */}
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-secondary rounded-full px-4 py-2 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-secondary-foreground">No signup required</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-display font-extrabold mb-6 text-foreground leading-tight"
          >
            Edit & Sign PDFs{" "}
            <span className="text-gradient">Instantly Free</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            The fastest way to edit text and add signatures to any PDF. 
            No downloads, no accounts, just results.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button 
              variant="hero" 
              size="xl" 
              className="gap-3"
              onClick={() => navigate("/editor")}
            >
              <Upload className="w-5 h-5" />
              Upload PDF — It's Free
            </Button>
            <Button variant="hero-outline" size="xl">
              See How It Works
            </Button>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-3 gap-6 mb-20"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-lg border border-border hover:shadow-glow hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">{feature.description}</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-3 py-1 rounded-full">
                  <Check className="w-3.5 h-3.5" />
                  {feature.free === true ? "Free" : feature.free}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Pro Upgrade Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-8 md:p-12 border border-primary/20"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Need More? Go Pro
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Unlock unlimited signatures, merge & split PDFs, fill forms, and enjoy an ad-free experience.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {proFeatures.map((feature) => (
                <span 
                  key={feature}
                  className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full text-sm font-medium text-foreground border border-border"
                >
                  <Check className="w-4 h-4 text-primary" />
                  {feature}
                </span>
              ))}
            </div>
            <Button variant="hero" size="lg">
              Upgrade to Pro — $4.99/month
            </Button>
          </motion.div>
        </div>

        {/* Ad Banner Placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16 ad-banner h-24 max-w-4xl mx-auto"
        >
          <span>Advertisement</span>
        </motion.div>
      </div>
    </section>
  );
}
