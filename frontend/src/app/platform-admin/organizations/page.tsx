"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle,
  XCircle,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { usePendingOrganizations, useBulkApproveOrganizations, useBulkSuspendOrganizations } from "@/hooks/use-platform-admin";
import { Organization } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";

export default function PlatformAdminOrganizations() {
  const { data: organizations, isLoading, error, refetch } = usePendingOrganizations();
  const bulkApproveMutation = useBulkApproveOrganizations();
  const bulkSuspendMutation = useBulkSuspendOrganizations();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [suspendReason, setSuspendReason] = useState("");

  const handleSelectAll = (checked: boolean) => {
    if (checked && organizations) {
      setSelectedIds(organizations.map(org => org.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOrg = (orgId: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, orgId]);
    } else {
      setSelectedIds(prev => prev.filter(id => id !== orgId));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;

    try {
      await bulkApproveMutation.mutateAsync(selectedIds);
      toast.success(`Successfully approved ${selectedIds.length} organizations`);
      setSelectedIds([]);
      refetch();
    } catch (error) {
      toast.error("Failed to approve organizations");
    }
  };

  const handleBulkSuspend = async () => {
    if (selectedIds.length === 0) return;

    try {
      await bulkSuspendMutation.mutateAsync({ organizationIds: selectedIds, reason: suspendReason });
      toast.success(`Successfully suspended ${selectedIds.length} organizations`);
      setSelectedIds([]);
      setSuspendReason("");
      refetch();
    } catch (error) {
      toast.error("Failed to suspend organizations");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading organizations</h3>
        <p className="mt-1 text-sm text-gray-500">
          There was an error loading the pending organizations.
        </p>
        <Button
          onClick={() => refetch()}
          className="mt-4"
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {selectedIds.length} organization{selectedIds.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleBulkApprove}
                  disabled={bulkApproveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Selected
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={bulkSuspendMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Suspend Selected
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Suspend Organizations</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to suspend {selectedIds.length} selected organization{selectedIds.length !== 1 ? 's' : ''}?
                        This action cannot be easily undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <label className="text-sm font-medium">Reason for suspension (optional)</label>
                      <textarea
                        className="mt-2 w-full p-2 border rounded-md"
                        placeholder="Enter reason for suspension..."
                        value={suspendReason}
                        onChange={(e) => setSuspendReason(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleBulkSuspend}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Suspend Organizations
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Organizations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Pending Organizations ({organizations?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!organizations || organizations.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending organizations</h3>
              <p className="mt-1 text-sm text-gray-500">
                All organizations have been reviewed.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === organizations.length && organizations.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org: Organization) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(org.id)}
                        onCheckedChange={(checked) => handleSelectOrg(org.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{org.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {org.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="w-3 h-3 mr-1" />
                          {org.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="w-3 h-3 mr-1" />
                          {org.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <MapPin className="w-3 h-3 mr-1" />
                        {org.city}, {org.state}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(org.created_at), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{org.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleSelectOrg(org.id, true)}
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}