#!/usr/bin/env python
"""
Check Ahmed's organization and hall data
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'marquee_system.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.core.models import Organization, Hall

User = get_user_model()

def check_ahmed_data():
    print("🔍 Checking Ahmed's data...")

    # Check if Ahmed exists
    try:
        ahmed = User.objects.get(username='venue_owner')
        print(f'✅ Ahmed found: {ahmed.first_name} {ahmed.last_name}')
        print(f'   Email: {ahmed.email}')

        # Check his organizations
        owned_orgs = ahmed.owned_organizations.all()
        print(f'   Owned organizations: {owned_orgs.count()}')
        for org in owned_orgs:
            print(f'     - {org.name} (ID: {org.id}, Status: {org.status})')

            # Check halls for this organization
            halls = org.halls.all()
            print(f'       Halls: {halls.count()}')
            for hall in halls:
                print(f'         - {hall.name} (Capacity: {hall.capacity}, Active: {hall.is_active})')

        # Check user profile
        if hasattr(ahmed, 'userprofile'):
            profile = ahmed.userprofile
            print(f'   User type: {profile.user_type}')
        else:
            print('   ❌ No user profile found')

    except User.DoesNotExist:
        print('❌ Ahmed (venue_owner) not found')
    except Exception as e:
        print(f'❌ Error: {e}')

if __name__ == '__main__':
    check_ahmed_data()