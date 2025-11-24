from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, StripeWebhookView

router = DefaultRouter(trailing_slash=False)
router.register('', BookingViewSet)

app_name = 'bookings'
urlpatterns = []
for url in router.urls:
    if 'pk' in str(url.pattern):
        # Modify patterns with pk to match remaining path starting with /
        pattern = url.pattern.regex.pattern.replace('^', '^/', 1)
        urlpatterns.append(re_path(pattern, url.callback, name=url.name))
    else:
        urlpatterns.append(url)
urlpatterns.append(path('stripe/webhook', StripeWebhookView.as_view(), name='stripe_webhook'))