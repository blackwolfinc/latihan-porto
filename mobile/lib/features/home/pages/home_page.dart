import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/utils/responsive.dart';
import '../../../shared/models/car.dart';
import '../../../shared/widgets/bottom_nav_bar.dart';
import '../../../shared/widgets/car_card.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/loading_shimmer.dart';
import '../../cars/bloc/car_bloc.dart';
import '../../cars/bloc/car_event.dart';
import '../../cars/bloc/car_state.dart';
import '../../../core/api/api_client.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _currentIndex = 0;
  final TextEditingController _searchController = TextEditingController();
  String? _selectedCategory;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => CarBloc(apiClient: ApiClient())..add(LoadCars()),
      child: ResponsiveBuilder(
        builder: (context, deviceType) {
          if (deviceType == DeviceType.mobile) {
            return _buildMobileLayout();
          }
          return _buildTabletLayout();
        },
      ),
    );
  }

  Widget _buildMobileLayout() {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _buildTabPages(),
      ),
      bottomNavigationBar: BottomNavBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        notificationCount: 3,
      ),
    );
  }

  Widget _buildTabletLayout() {
    return Scaffold(
      body: Row(
        children: [
          NavigationRail(
            selectedIndex: _currentIndex,
            onDestinationSelected: (index) => setState(() => _currentIndex = index),
            labelType: NavigationRailLabelType.all,
            leading: Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Icon(Icons.directions_car, color: AppColors.primary, size: 32),
            ),
            destinations: const [
              NavigationRailDestination(
                icon: Icon(Icons.home_outlined),
                selectedIcon: Icon(Icons.home),
                label: Text('Beranda'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.receipt_long_outlined),
                selectedIcon: Icon(Icons.receipt_long),
                label: Text('Booking'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.notifications_outlined),
                selectedIcon: Icon(Icons.notifications),
                label: Text('Notifikasi'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.person_outlined),
                selectedIcon: Icon(Icons.person),
                label: Text('Profil'),
              ),
            ],
          ),
          const VerticalDivider(thickness: 1, width: 1),
          Expanded(
            child: IndexedStack(
              index: _currentIndex,
              children: _buildTabPages(),
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildTabPages() => [
        _buildHomeContent(),
        _buildPlaceholderTab(Icons.receipt_long_outlined, 'Pemesanan Anda', 'Lihat Pemesanan', '/my-bookings'),
        _buildPlaceholderTab(Icons.notifications_outlined, 'Notifikasi', 'Lihat Notifikasi', '/notifications'),
        _buildPlaceholderTab(Icons.person_outlined, 'Profil Anda', 'Lihat Profil', '/profile'),
      ];

  Widget _buildPlaceholderTab(IconData icon, String title, String buttonLabel, String route) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 64, color: Colors.grey),
          const SizedBox(height: 16),
          Text(title),
          const SizedBox(height: 8),
          ElevatedButton(
            onPressed: () => context.push(route),
            child: Text(buttonLabel),
          ),
        ],
      ),
    );
  }

  Widget _buildHomeContent() {
    final isTabletDevice = isTablet(context);
    final hPadding = responsiveHorizontalPadding(context);
    final gridCount = responsiveGridCount(context, mobile: 1, tablet: 2, desktop: 3);

    return SafeArea(
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(hPadding, AppSizes.paddingMD, hPadding, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Selamat Datang!',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  fontSize: isTabletDevice ? 28 : null,
                                ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Mau sewa mobil apa hari ini?',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                          ),
                        ],
                      ),
                      CircleAvatar(
                        radius: isTabletDevice ? 28 : 24,
                        backgroundColor: AppColors.primaryLight,
                        child: const Icon(Icons.person, color: Colors.white),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 600),
                    child: TextField(
                      controller: _searchController,
                      decoration: InputDecoration(
                        hintText: 'Cari mobil...',
                        prefixIcon: const Icon(Icons.search),
                        suffixIcon: IconButton(
                          icon: const Icon(Icons.tune),
                          onPressed: () {},
                        ),
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(AppSizes.radiusMD),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      onSubmitted: (value) {
                        if (value.isNotEmpty) {
                          context.push('/cars?search=$value');
                        }
                      },
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    height: 40,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: [
                        _buildCategoryChip('Semua', null),
                        ...CarCategory.all.map((cat) => _buildCategoryChip(cat, cat)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: hPadding),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Mobil Unggulan',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  TextButton(
                    onPressed: () => context.push('/cars'),
                    child: const Text('Lihat Semua'),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: SizedBox(
              height: isTabletDevice ? 260 : 220,
              child: BlocBuilder<CarBloc, CarState>(
                builder: (context, state) {
                  if (state is CarLoading) {
                    return ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: EdgeInsets.symmetric(horizontal: hPadding),
                      itemCount: isTabletDevice ? 5 : 3,
                      itemBuilder: (context, index) => SizedBox(
                        width: isTabletDevice ? 240 : 200,
                        child: const CarCardShimmer(),
                      ),
                    );
                  }
                  if (state is CarLoaded) {
                    final featuredCars = state.cars.take(5).toList();
                    return ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: EdgeInsets.symmetric(horizontal: hPadding),
                      itemCount: featuredCars.length,
                      itemBuilder: (context, index) {
                        return SizedBox(
                          width: isTabletDevice ? 240 : 200,
                          child: CarCard(
                            car: featuredCars[index],
                            isCompact: true,
                            onTap: () => context.push('/cars/${featuredCars[index].id}'),
                          ),
                        );
                      },
                    );
                  }
                  return const SizedBox.shrink();
                },
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(hPadding, AppSizes.paddingMD, hPadding, AppSizes.paddingSM),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Mobil Terdekat',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  TextButton(
                    onPressed: () => context.push('/cars'),
                    child: const Text('Lihat Semua'),
                  ),
                ],
              ),
            ),
          ),
          BlocBuilder<CarBloc, CarState>(
            builder: (context, state) {
              if (state is CarLoading) {
                if (isTabletDevice) {
                  return SliverPadding(
                    padding: EdgeInsets.symmetric(horizontal: hPadding),
                    sliver: SliverGrid(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) => const CarCardShimmer(),
                        childCount: 4,
                      ),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: gridCount,
                        childAspectRatio: 0.85,
                        mainAxisSpacing: 12,
                        crossAxisSpacing: 12,
                      ),
                    ),
                  );
                }
                return SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => const CarCardShimmer(),
                    childCount: 3,
                  ),
                );
              }
              if (state is CarLoaded) {
                final cars = state.cars;
                final count = cars.length.clamp(0, 10);
                if (isTabletDevice) {
                  return SliverPadding(
                    padding: EdgeInsets.symmetric(horizontal: hPadding),
                    sliver: SliverGrid(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) => CarCard(
                          car: cars[index],
                          onTap: () => context.push('/cars/${cars[index].id}'),
                        ),
                        childCount: count,
                      ),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: gridCount,
                        childAspectRatio: 0.85,
                        mainAxisSpacing: 12,
                        crossAxisSpacing: 12,
                      ),
                    ),
                  );
                }
                return SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => CarCard(
                      car: cars[index],
                      onTap: () => context.push('/cars/${cars[index].id}'),
                    ),
                    childCount: count,
                  ),
                );
              }
              if (state is CarError) {
                return SliverToBoxAdapter(
                  child: EmptyState(
                    icon: Icons.error_outline,
                    title: 'Terjadi Kesalahan',
                    subtitle: state.message,
                    buttonText: 'Coba Lagi',
                    onButtonPressed: () => context.read<CarBloc>().add(LoadCars()),
                  ),
                );
              }
              return const SliverToBoxAdapter(child: SizedBox.shrink());
            },
          ),
          const SliverPadding(padding: EdgeInsets.only(bottom: 20)),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(String label, String? category) {
    final isSelected = _selectedCategory == category;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (_) {
          setState(() => _selectedCategory = category);
        },
        selectedColor: AppColors.primary.withOpacity(0.2),
        checkmarkColor: AppColors.primary,
        labelStyle: TextStyle(
          color: isSelected ? AppColors.primary : AppColors.textSecondary,
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
        ),
      ),
    );
  }
}
