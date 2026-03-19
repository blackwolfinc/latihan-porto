import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:badges/badges.dart' as badges;
import '../../../core/constants/app_constants.dart';
import '../../../shared/models/car.dart';
import '../../../shared/widgets/car_card.dart';
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
      child: Scaffold(
        body: IndexedStack(
          index: _currentIndex,
          children: [
            _buildHomeContent(),
            _buildBookingsTab(),
            _buildNotificationsTab(),
            _buildProfileTab(),
          ],
        ),
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          items: [
            const BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Beranda',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.receipt_long_outlined),
              activeIcon: Icon(Icons.receipt_long),
              label: 'Pemesanan',
            ),
            BottomNavigationBarItem(
              icon: badges.Badge(
                badgeContent: const Text(
                  '3',
                  style: TextStyle(color: Colors.white, fontSize: 10),
                ),
                child: const Icon(Icons.notifications_outlined),
              ),
              activeIcon: const Icon(Icons.notifications),
              label: 'Notifikasi',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.person_outlined),
              activeIcon: Icon(Icons.person),
              label: 'Profil',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHomeContent() {
    return SafeArea(
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(AppSizes.paddingMD),
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
                        radius: 24,
                        backgroundColor: AppColors.primaryLight,
                        child: const Icon(Icons.person, color: Colors.white),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  TextField(
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
              padding: const EdgeInsets.symmetric(horizontal: AppSizes.paddingMD),
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
              height: 220,
              child: BlocBuilder<CarBloc, CarState>(
                builder: (context, state) {
                  if (state is CarLoading) {
                    return ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: AppSizes.paddingMD),
                      itemCount: 3,
                      itemBuilder: (context, index) => const SizedBox(
                        width: 200,
                        child: CarCardShimmer(),
                      ),
                    );
                  }
                  if (state is CarLoaded) {
                    final featuredCars = state.cars.take(5).toList();
                    return ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: AppSizes.paddingMD),
                      itemCount: featuredCars.length,
                      itemBuilder: (context, index) {
                        return CarCard(
                          car: featuredCars[index],
                          isCompact: true,
                          onTap: () => context.push('/cars/${featuredCars[index].id}'),
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
              padding: const EdgeInsets.fromLTRB(
                AppSizes.paddingMD,
                AppSizes.paddingMD,
                AppSizes.paddingMD,
                AppSizes.paddingSM,
              ),
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
                return SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => const CarCardShimmer(),
                    childCount: 3,
                  ),
                );
              }
              if (state is CarLoaded) {
                final cars = state.cars;
                return SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => CarCard(
                      car: cars[index],
                      onTap: () => context.push('/cars/${cars[index].id}'),
                    ),
                    childCount: cars.length.clamp(0, 10),
                  ),
                );
              }
              if (state is CarError) {
                return SliverToBoxAdapter(
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        children: [
                          const Icon(Icons.error_outline, size: 48, color: Colors.grey),
                          const SizedBox(height: 8),
                          Text(state.message),
                          const SizedBox(height: 8),
                          TextButton(
                            onPressed: () => context.read<CarBloc>().add(LoadCars()),
                            child: const Text('Coba Lagi'),
                          ),
                        ],
                      ),
                    ),
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

  Widget _buildBookingsTab() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.receipt_long_outlined, size: 64, color: Colors.grey),
          const SizedBox(height: 16),
          const Text('Pemesanan Anda'),
          const SizedBox(height: 8),
          ElevatedButton(
            onPressed: () => context.push('/my-bookings'),
            child: const Text('Lihat Pemesanan'),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationsTab() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.notifications_outlined, size: 64, color: Colors.grey),
          const SizedBox(height: 16),
          const Text('Notifikasi'),
          const SizedBox(height: 8),
          ElevatedButton(
            onPressed: () => context.push('/notifications'),
            child: const Text('Lihat Notifikasi'),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileTab() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.person_outlined, size: 64, color: Colors.grey),
          const SizedBox(height: 16),
          const Text('Profil Anda'),
          const SizedBox(height: 8),
          ElevatedButton(
            onPressed: () => context.push('/profile'),
            child: const Text('Lihat Profil'),
          ),
        ],
      ),
    );
  }
}
