import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/utils/responsive.dart';
import '../../../shared/widgets/booking_card.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/loading_shimmer.dart';
import '../bloc/booking_bloc.dart';
import '../bloc/booking_event.dart';
import '../bloc/booking_state.dart';

class BookingListPage extends StatelessWidget {
  const BookingListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => BookingBloc(apiClient: ApiClient())..add(const LoadBookings()),
      child: const _BookingListView(),
    );
  }
}

class _BookingListView extends StatefulWidget {
  const _BookingListView();

  @override
  State<_BookingListView> createState() => _BookingListViewState();
}

class _BookingListViewState extends State<_BookingListView> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _tabStatuses = [null, 'ACTIVE', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  final _tabLabels = ['Semua', 'Aktif', 'Mendatang', 'Selesai', 'Dibatalkan'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabLabels.length, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        context.read<BookingBloc>().add(LoadBookings(status: _tabStatuses[_tabController.index]));
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isTabletDevice = isTablet(context);
    final hPadding = responsiveHorizontalPadding(context);
    final gridCount = responsiveGridCount(context, mobile: 1, tablet: 2, desktop: 3);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Pemesanan Saya'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          indicatorColor: Colors.white,
          tabAlignment: TabAlignment.start,
          tabs: _tabLabels.map((label) => Tab(text: label)).toList(),
        ),
      ),
      body: BlocBuilder<BookingBloc, BookingState>(
        builder: (context, state) {
          if (state is BookingLoading) {
            if (isTabletDevice) {
              return GridView.builder(
                padding: EdgeInsets.all(hPadding),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: gridCount,
                  childAspectRatio: 1.6,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                ),
                itemCount: 4,
                itemBuilder: (_, __) => const BookingCardShimmer(),
              );
            }
            return ListView.builder(
              padding: const EdgeInsets.all(AppSizes.paddingSM),
              itemCount: 5,
              itemBuilder: (_, __) => const BookingCardShimmer(),
            );
          }
          if (state is BookingsLoaded) {
            if (state.bookings.isEmpty) {
              return const EmptyState(
                icon: Icons.receipt_long_outlined,
                title: 'Belum ada pemesanan',
                subtitle: 'Pemesanan Anda akan muncul di sini',
              );
            }
            return RefreshIndicator(
              onRefresh: () async {
                context.read<BookingBloc>().add(
                      LoadBookings(status: _tabStatuses[_tabController.index]),
                    );
              },
              child: isTabletDevice
                  ? GridView.builder(
                      padding: EdgeInsets.all(hPadding),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: gridCount,
                        childAspectRatio: 1.6,
                        mainAxisSpacing: 12,
                        crossAxisSpacing: 12,
                      ),
                      itemCount: state.bookings.length,
                      itemBuilder: (context, index) {
                        return BookingCard(
                          booking: state.bookings[index],
                          onTap: () => context.push('/bookings/${state.bookings[index].id}'),
                        );
                      },
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(AppSizes.paddingSM),
                      itemCount: state.bookings.length,
                      itemBuilder: (context, index) {
                        return BookingCard(
                          booking: state.bookings[index],
                          onTap: () => context.push('/bookings/${state.bookings[index].id}'),
                        );
                      },
                    ),
            );
          }
          if (state is BookingError) {
            return EmptyState(
              icon: Icons.error_outline,
              title: 'Terjadi Kesalahan',
              subtitle: state.message,
              buttonText: 'Coba Lagi',
              onButtonPressed: () => context.read<BookingBloc>().add(const LoadBookings()),
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }
}
