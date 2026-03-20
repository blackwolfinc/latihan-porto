import 'package:flutter/material.dart';

/// Breakpoints for responsive design
class Breakpoints {
  Breakpoints._();

  static const double mobile = 600;
  static const double tablet = 900;
  static const double desktop = 1200;
}

/// Device type enum
enum DeviceType { mobile, tablet, desktop }

/// Get device type from screen width
DeviceType getDeviceTypeFromWidth(double width) {
  if (width >= Breakpoints.desktop) return DeviceType.desktop;
  if (width >= Breakpoints.mobile) return DeviceType.tablet;
  return DeviceType.mobile;
}

/// Get device type from context
DeviceType getDeviceType(BuildContext context) {
  return getDeviceTypeFromWidth(MediaQuery.of(context).size.width);
}

/// Check if current device is tablet or larger
bool isTablet(BuildContext context) {
  return getDeviceType(context) != DeviceType.mobile;
}

/// Responsive value based on device type
T responsive<T>(BuildContext context, {
  required T mobile,
  T? tablet,
  T? desktop,
}) {
  final type = getDeviceType(context);
  switch (type) {
    case DeviceType.desktop:
      return desktop ?? tablet ?? mobile;
    case DeviceType.tablet:
      return tablet ?? mobile;
    case DeviceType.mobile:
      return mobile;
  }
}

/// Widget that builds different layouts based on screen size
class ResponsiveBuilder extends StatelessWidget {
  final Widget Function(BuildContext context, DeviceType deviceType) builder;

  const ResponsiveBuilder({super.key, required this.builder});

  @override
  Widget build(BuildContext context) {
    return builder(context, getDeviceType(context));
  }
}

/// Constrains content width on large screens with centered alignment
class ResponsiveContainer extends StatelessWidget {
  final Widget child;
  final double maxWidth;
  final EdgeInsetsGeometry? padding;

  const ResponsiveContainer({
    super.key,
    required this.child,
    this.maxWidth = 800,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: maxWidth),
        child: padding != null
            ? Padding(padding: padding!, child: child)
            : child,
      ),
    );
  }
}

/// Returns the number of grid columns based on screen width
int responsiveGridCount(BuildContext context, {
  int mobile = 1,
  int tablet = 2,
  int desktop = 3,
}) {
  return responsive(context, mobile: mobile, tablet: tablet, desktop: desktop);
}

/// Returns responsive padding based on device type
EdgeInsets responsivePadding(BuildContext context) {
  return responsive(
    context,
    mobile: const EdgeInsets.all(16),
    tablet: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
    desktop: const EdgeInsets.symmetric(horizontal: 48, vertical: 24),
  );
}

/// Responsive horizontal padding that increases on tablets
double responsiveHorizontalPadding(BuildContext context) {
  return responsive<double>(context, mobile: 16, tablet: 32, desktop: 48);
}
