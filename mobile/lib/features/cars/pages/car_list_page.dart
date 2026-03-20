import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/utils/responsive.dart';
import '../../../shared/widgets/car_card.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/loading_shimmer.dart';
import '../../../shared/widgets/custom_app_bar.dart';
import '../bloc/car_bloc.dart';
import '../bloc/car_event.dart';
import '../bloc/car_state.dart';

class CarListPage extends StatefulWidget {
  const CarListPage({super.key});

  @override
  State<CarListPage> createState() => _CarListPageState();
}

class _CarListPageState extends State<CarListPage> {
  final TextEditingController _searchController = TextEditingController();
  String? _selectedCategory;
  String _sortBy = 'newest';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isTabletDevice = isTablet(context);
    final hPadding = responsiveHorizontalPadding(context);
    final gridCount = responsiveGridCount(context, mobile: 1, tablet: 2, desktop: 3);

    return BlocProvider(
      create: (_) => CarBloc(apiClient: ApiClient())..add(const LoadCars()),
      child: Scaffold(
        appBar: CustomAppBar(
          title: 'Daftar Mobil',
          actions: [
            IconButton(
              icon: const Icon(Icons.sort),
              onPressed: () => _showSortDialog(context),
            ),
          ],
        ),
        body: Column(
          children: [
            Container(
              padding: EdgeInsets.symmetric(horizontal: hPadding, vertical: AppSizes.paddingMD),
              color: Colors.white,
              child: Column(
                children: [
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 600),
                    child: Builder(
                      builder: (context) {
                        return TextField(
                          controller: _searchController,
                          decoration: InputDecoration(
                            hintText: 'Cari mobil...',
                            prefixIcon: const Icon(Icons.search),
                            suffixIcon: _searchController.text.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.clear),
                                    onPressed: () {
                                      _searchController.clear();
                                      context.read<CarBloc>().add(const LoadCars());
                                      setState(() {});
                                    },
                                  )
                                : null,
                          ),
                          onSubmitted: (value) {
                            context.read<CarBloc>().add(LoadCars(
                                  search: value,
                                  category: _selectedCategory,
                                  sortBy: _sortBy,
                                ));
                          },
                          onChanged: (_) => setState(() {}),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 36,
                    child: Builder(
                      builder: (context) {
                        return ListView(
                          scrollDirection: Axis.horizontal,
                          children: [
                            _buildFilterChip(context, 'Semua', null),
                            ...CarCategory.all.map((cat) => _buildFilterChip(context, cat, cat)),
                          ],
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: BlocBuilder<CarBloc, CarState>(
                builder: (context, state) {
                  if (state is CarLoading) {
                    if (isTabletDevice) {
                      return GridView.builder(
                        padding: EdgeInsets.all(hPadding),
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: gridCount,
                          childAspectRatio: 0.85,
                          mainAxisSpacing: 12,
                          crossAxisSpacing: 12,
                        ),
                        itemCount: 6,
                        itemBuilder: (_, __) => const CarCardShimmer(),
                      );
                    }
                    return ListView.builder(
                      padding: const EdgeInsets.all(AppSizes.paddingSM),
                      itemCount: 5,
                      itemBuilder: (_, __) => const CarCardShimmer(),
                    );
                  }
                  if (state is CarLoaded) {
                    if (state.cars.isEmpty) {
                      return const EmptyState(
                        icon: Icons.directions_car_outlined,
                        title: 'Tidak ada mobil ditemukan',
                        subtitle: 'Coba ubah filter pencarian Anda',
                      );
                    }
                    if (isTabletDevice) {
                      return GridView.builder(
                        padding: EdgeInsets.all(hPadding),
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: gridCount,
                          childAspectRatio: 0.85,
                          mainAxisSpacing: 12,
                          crossAxisSpacing: 12,
                        ),
                        itemCount: state.cars.length,
                        itemBuilder: (context, index) {
                          return CarCard(
                            car: state.cars[index],
                            onTap: () => context.push('/cars/${state.cars[index].id}'),
                          );
                        },
                      );
                    }
                    return ListView.builder(
                      padding: const EdgeInsets.all(AppSizes.paddingSM),
                      itemCount: state.cars.length,
                      itemBuilder: (context, index) {
                        return CarCard(
                          car: state.cars[index],
                          onTap: () => context.push('/cars/${state.cars[index].id}'),
                        );
                      },
                    );
                  }
                  if (state is CarError) {
                    return EmptyState(
                      icon: Icons.error_outline,
                      title: 'Terjadi Kesalahan',
                      subtitle: state.message,
                      buttonText: 'Coba Lagi',
                      onButtonPressed: () => context.read<CarBloc>().add(const LoadCars()),
                    );
                  }
                  return const SizedBox.shrink();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(BuildContext context, String label, String? category) {
    final isSelected = _selectedCategory == category;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label, style: TextStyle(fontSize: 12)),
        selected: isSelected,
        onSelected: (_) {
          setState(() => _selectedCategory = category);
          context.read<CarBloc>().add(LoadCars(
                search: _searchController.text,
                category: category,
                sortBy: _sortBy,
              ));
        },
        selectedColor: AppColors.primary.withOpacity(0.2),
        visualDensity: VisualDensity.compact,
      ),
    );
  }

  void _showSortDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      constraints: const BoxConstraints(maxWidth: 500),
      builder: (sheetContext) => Padding(
        padding: const EdgeInsets.all(AppSizes.paddingMD),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Urutkan',
              style: Theme.of(sheetContext).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _buildSortOption(sheetContext, 'Terbaru', 'newest'),
            _buildSortOption(sheetContext, 'Harga Terendah', 'price_asc'),
            _buildSortOption(sheetContext, 'Harga Tertinggi', 'price_desc'),
            _buildSortOption(sheetContext, 'Rating Tertinggi', 'rating'),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildSortOption(BuildContext context, String label, String value) {
    return ListTile(
      title: Text(label),
      trailing: _sortBy == value ? const Icon(Icons.check, color: AppColors.primary) : null,
      onTap: () {
        setState(() => _sortBy = value);
        Navigator.pop(context);
      },
    );
  }
}
