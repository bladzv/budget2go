/**
 * lucide-setup.js — Import tree-shaken Lucide icons and expose as window.lucide.
 * Must be the FIRST import in main.js so window.lucide is ready before any IIFE runs.
 */
import {
  AlertCircle,
  Calculator,
  Check,
  CheckCircle2,
  CreditCard,
  Download,
  FileJson,
  FileText,
  FileUp,
  Globe,
  Info,
  Lock,
  Moon,
  PiggyBank,
  Plus,
  Receipt,
  Sun,
  Trash2,
  TrendingUp,
  Upload,
  Wallet,
  X,
  createIcons,
} from 'lucide';

const ICONS = {
  AlertCircle,
  Calculator,
  Check,
  CheckCircle2,
  CreditCard,
  Download,
  FileJson,
  FileText,
  FileUp,
  Globe,
  Info,
  Lock,
  Moon,
  PiggyBank,
  Plus,
  Receipt,
  Sun,
  Trash2,
  TrendingUp,
  Upload,
  Wallet,
  X,
};

window.lucide = {
  createIcons: () => createIcons({ icons: ICONS }),
};
