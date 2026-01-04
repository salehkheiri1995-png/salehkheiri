import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Palette, Type, Square, RotateCcw, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import {
  useThemeSettings,
  applyTheme,
  availableFonts,
  fontSizes,
  borderRadiusOptions,
  ThemeSettings,
} from "@/hooks/useThemeSettings";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
  // Convert HSL string to hex for the color picker
  const hslToHex = (hsl: string) => {
    const parts = hsl.split(" ");
    if (parts.length !== 3) return "#d4a574";
    
    const h = parseFloat(parts[0]) / 360;
    const s = parseFloat(parts[1]) / 100;
    const l = parseFloat(parts[2]) / 100;

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Convert hex to HSL string
  const hexToHsl = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return value;

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2 items-center">
        <div className="relative">
          <input
            type="color"
            value={hslToHex(value)}
            onChange={(e) => onChange(hexToHsl(e.target.value))}
            className="w-12 h-10 rounded-lg border border-border cursor-pointer"
          />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="15 60% 65%"
          dir="ltr"
          className="font-mono text-sm"
        />
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export default function ThemeSettingsTab() {
  const { toast } = useToast();
  const { theme, isLoading, updateTheme } = useThemeSettings();
  const [localTheme, setLocalTheme] = useState<Partial<ThemeSettings>>({});
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (theme) {
      setLocalTheme(theme);
    }
  }, [theme]);

  const handleChange = (key: keyof ThemeSettings, value: string | number) => {
    const newTheme = { ...localTheme, [key]: value };
    setLocalTheme(newTheme);
    
    // Apply preview immediately
    if (previewMode) {
      applyTheme(newTheme);
    }
  };

  const handleSave = async () => {
    try {
      await updateTheme.mutateAsync(localTheme);
      applyTheme(localTheme);
      toast({
        title: "ذخیره شد",
        description: "تنظیمات ظاهری با موفقیت ذخیره شد.",
      });
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    const defaultTheme = {
      primary_color: "15 60% 65%",
      secondary_color: "350 40% 92%",
      accent_color: "38 70% 55%",
      background_color: "30 30% 98%",
      foreground_color: "20 20% 15%",
      muted_color: "35 30% 94%",
      card_color: "30 25% 97%",
      font_family: "Vazirmatn",
      heading_font_family: "Vazirmatn",
      base_font_size: "16px",
      heading_scale: 1.25,
      border_radius: "0.75rem",
    };
    setLocalTheme({ ...localTheme, ...defaultTheme });
    applyTheme(defaultTheme);
    toast({
      title: "بازنشانی",
      description: "تنظیمات به حالت پیش‌فرض برگشت.",
    });
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
    if (!previewMode) {
      applyTheme(localTheme);
      toast({
        title: "حالت پیش‌نمایش",
        description: "تغییرات به صورت زنده نمایش داده می‌شوند.",
      });
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">در حال بارگذاری...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          variant={previewMode ? "default" : "outline"}
          onClick={togglePreview}
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          {previewMode ? "پیش‌نمایش فعال" : "پیش‌نمایش زنده"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          بازنشانی
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Colors Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                رنگ‌ها
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ColorPicker
                label="رنگ اصلی (Primary)"
                value={localTheme.primary_color || "15 60% 65%"}
                onChange={(v) => handleChange("primary_color", v)}
                description="رنگ دکمه‌ها و عناصر اصلی"
              />
              <ColorPicker
                label="رنگ ثانویه (Secondary)"
                value={localTheme.secondary_color || "350 40% 92%"}
                onChange={(v) => handleChange("secondary_color", v)}
                description="رنگ پس‌زمینه‌های ثانویه"
              />
              <ColorPicker
                label="رنگ تأکیدی (Accent)"
                value={localTheme.accent_color || "38 70% 55%"}
                onChange={(v) => handleChange("accent_color", v)}
                description="رنگ برجسته‌سازی و تأکید"
              />
              <ColorPicker
                label="رنگ پس‌زمینه"
                value={localTheme.background_color || "30 30% 98%"}
                onChange={(v) => handleChange("background_color", v)}
                description="رنگ کلی پس‌زمینه سایت"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* More Colors */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                رنگ‌های بیشتر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ColorPicker
                label="رنگ متن"
                value={localTheme.foreground_color || "20 20% 15%"}
                onChange={(v) => handleChange("foreground_color", v)}
                description="رنگ متن‌های اصلی"
              />
              <ColorPicker
                label="رنگ کارت‌ها"
                value={localTheme.card_color || "30 25% 97%"}
                onChange={(v) => handleChange("card_color", v)}
                description="رنگ پس‌زمینه کارت‌ها"
              />
              <ColorPicker
                label="رنگ بی‌رنگ (Muted)"
                value={localTheme.muted_color || "35 30% 94%"}
                onChange={(v) => handleChange("muted_color", v)}
                description="رنگ عناصر کم‌رنگ"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Typography Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                تایپوگرافی
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>فونت متن</Label>
                <Select
                  value={localTheme.font_family || "Vazirmatn"}
                  onValueChange={(v) => handleChange("font_family", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFonts.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>فونت عناوین</Label>
                <Select
                  value={localTheme.heading_font_family || "Vazirmatn"}
                  onValueChange={(v) => handleChange("heading_font_family", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFonts.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>اندازه فونت پایه</Label>
                <Select
                  value={localTheme.base_font_size || "16px"}
                  onValueChange={(v) => handleChange("base_font_size", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontSizes.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label} ({size.value})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>نسبت اندازه عناوین: {localTheme.heading_scale || 1.25}</Label>
                <Slider
                  value={[localTheme.heading_scale || 1.25]}
                  onValueChange={([v]) => handleChange("heading_scale", v)}
                  min={1}
                  max={2}
                  step={0.05}
                  className="py-2"
                />
                <p className="text-xs text-muted-foreground">
                  نسبت بزرگ‌تر = عناوین بزرگ‌تر
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Borders & Radius Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Square className="w-5 h-5" />
                گوشه‌ها و حاشیه‌ها
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>گردی گوشه‌ها</Label>
                <Select
                  value={localTheme.border_radius || "0.75rem"}
                  onValueChange={(v) => handleChange("border_radius", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {borderRadiusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preview Box */}
              <div className="space-y-2">
                <Label>پیش‌نمایش</Label>
                <div
                  className="p-4 border-2 border-primary bg-card"
                  style={{ borderRadius: localTheme.border_radius || "0.75rem" }}
                >
                  <p className="text-sm text-muted-foreground">
                    این یک نمونه متن است برای نمایش گردی گوشه‌ها
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateTheme.isPending}
          size="lg"
          className="gap-2"
        >
          {updateTheme.isPending ? "در حال ذخیره..." : "ذخیره تنظیمات ظاهری"}
        </Button>
      </div>
    </div>
  );
}
