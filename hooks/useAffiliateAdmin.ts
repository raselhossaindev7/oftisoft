"use client";

import { useState, useEffect, useCallback } from "react";
import { affiliateAdminAPI } from "@/lib/api";
import { toast } from "sonner";

export function useAffiliateAdmin() {
    const [dashboardStats, setDashboardStats] = useState<any>(null);
    const [affiliates, setAffiliates] = useState<any>(null);
    const [commissions, setCommissions] = useState<any>(null);
    const [withdrawals, setWithdrawals] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingAffiliates, setIsLoadingAffiliates] = useState(false);
    const [isLoadingCommissions, setIsLoadingCommissions] = useState(false);
    const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState(false);
    const [isLoadingSettings, setIsLoadingSettings] = useState(false);
    const [auditLogs, setAuditLogs] = useState<any>(null);
    const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false);
    const [auditStats, setAuditStats] = useState<any>(null);

    const [pagination, setPagination] = useState({
        affiliates: { page: 1, limit: 20, total: 0, totalPages: 0 },
        commissions: { page: 1, limit: 20, total: 0, totalPages: 0 },
        withdrawals: { page: 1, limit: 20, total: 0, totalPages: 0 },
        auditLogs: { page: 1, limit: 50, total: 0, totalPages: 0 },
    });

    // Fetch Dashboard Stats
    const fetchDashboard = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await affiliateAdminAPI.getDashboardStats();
            setDashboardStats(data);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to load dashboard stats");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch Affiliates
    const fetchAffiliates = useCallback(async (params?: { page?: number; status?: string; tier?: string; search?: string }) => {
        try {
            setIsLoadingAffiliates(true);
            const data = await affiliateAdminAPI.getAffiliates(params);
            setAffiliates(data);
            if (data.meta) {
                setPagination(prev => ({ 
                    ...prev, 
                    affiliates: {
                        page: data.meta.page,
                        limit: data.meta.limit,
                        total: data.meta.total,
                        totalPages: data.meta.totalPages,
                    }
                }));
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to load affiliates");
        } finally {
            setIsLoadingAffiliates(false);
        }
    }, []);

    // Fetch Commissions
    const fetchCommissions = useCallback(async (params?: { page?: number; status?: string; affiliateId?: string }) => {
        try {
            setIsLoadingCommissions(true);
            const data = await affiliateAdminAPI.getCommissions(params);
            setCommissions(data);
            if (data.meta) {
                setPagination(prev => ({ 
                    ...prev, 
                    commissions: {
                        page: data.meta.page,
                        limit: data.meta.limit,
                        total: data.meta.total,
                        totalPages: data.meta.totalPages,
                    }
                }));
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to load commissions");
        } finally {
            setIsLoadingCommissions(false);
        }
    }, []);

    // Fetch Withdrawals
    const fetchWithdrawals = useCallback(async (params?: { page?: number; status?: string; affiliateId?: string }) => {
        try {
            setIsLoadingWithdrawals(true);
            const data = await affiliateAdminAPI.getWithdrawals(params);
            setWithdrawals(data);
            if (data.meta) {
                setPagination(prev => ({ 
                    ...prev, 
                    withdrawals: {
                        page: data.meta.page,
                        limit: data.meta.limit,
                        total: data.meta.total,
                        totalPages: data.meta.totalPages,
                    }
                }));
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to load withdrawals");
        } finally {
            setIsLoadingWithdrawals(false);
        }
    }, []);

    // Fetch Settings
    const fetchSettings = useCallback(async () => {
        try {
            setIsLoadingSettings(true);
            const data = await affiliateAdminAPI.getSettings();
            setSettings(data);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to load settings");
        } finally {
            setIsLoadingSettings(false);
        }
    }, []);

    // Fetch Audit Logs
    const fetchAuditLogs = useCallback(async (params?: { page?: number; limit?: number; affiliateId?: string; action?: string; dateFrom?: string; dateTo?: string }) => {
        try {
            setIsLoadingAuditLogs(true);
            const data = await affiliateAdminAPI.getAuditLogs(params);
            setAuditLogs(data);
            if (data.meta) {
                setPagination(prev => ({
                    ...prev,
                    auditLogs: {
                        page: data.meta.page,
                        limit: data.meta.limit,
                        total: data.meta.total,
                        totalPages: data.meta.totalPages,
                    }
                }));
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to load audit logs");
        } finally {
            setIsLoadingAuditLogs(false);
        }
    }, []);

    // Fetch Audit Stats
    const fetchAuditStats = useCallback(async (days?: number) => {
        try {
            const data = await affiliateAdminAPI.getAuditStats(days);
            setAuditStats(data);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to load audit stats");
        }
    }, []);

    // Approve Affiliate
    const approveAffiliate = useCallback(async (affiliateId: string) => {
        try {
            await affiliateAdminAPI.approveAffiliate(affiliateId);
            toast.success("Affiliate approved successfully");
            fetchAffiliates();
            fetchDashboard();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to approve affiliate");
        }
    }, [fetchAffiliates, fetchDashboard]);

    // Suspend Affiliate
    const suspendAffiliate = useCallback(async (affiliateId: string, reason?: string) => {
        try {
            await affiliateAdminAPI.suspendAffiliate(affiliateId, reason);
            toast.success("Affiliate suspended successfully");
            fetchAffiliates();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to suspend affiliate");
        }
    }, [fetchAffiliates]);

    // Ban Affiliate
    const banAffiliate = useCallback(async (affiliateId: string, reason?: string) => {
        try {
            await affiliateAdminAPI.banAffiliate(affiliateId, reason);
            toast.success("Affiliate banned successfully");
            fetchAffiliates();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to ban affiliate");
        }
    }, [fetchAffiliates]);

    // Update Tier
    const updateTier = useCallback(async (affiliateId: string, tier: string) => {
        try {
            await affiliateAdminAPI.updateAffiliateTier(affiliateId, tier);
            toast.success("Tier updated successfully");
            fetchAffiliates();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to update tier");
        }
    }, [fetchAffiliates]);

    // Update Rate
    const updateRate = useCallback(async (affiliateId: string, rate: number) => {
        try {
            await affiliateAdminAPI.updateAffiliateRate(affiliateId, rate);
            toast.success("Commission rate updated successfully");
            fetchAffiliates();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to update rate");
        }
    }, [fetchAffiliates]);

    // Approve Commission
    const approveCommission = useCallback(async (commissionId: string) => {
        try {
            await affiliateAdminAPI.approveCommission(commissionId);
            toast.success("Commission approved successfully");
            fetchCommissions();
            fetchDashboard();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to approve commission");
        }
    }, [fetchCommissions, fetchDashboard]);

    // Reject Commission
    const rejectCommission = useCallback(async (commissionId: string, reason?: string) => {
        try {
            await affiliateAdminAPI.rejectCommission(commissionId, reason);
            toast.success("Commission rejected successfully");
            fetchCommissions();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to reject commission");
        }
    }, [fetchCommissions]);

    // Approve Withdrawal
    const approveWithdrawal = useCallback(async (withdrawalId: string) => {
        try {
            await affiliateAdminAPI.approveWithdrawal(withdrawalId);
            toast.success("Withdrawal approved successfully");
            fetchWithdrawals();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to approve withdrawal");
        }
    }, [fetchWithdrawals]);

    // Reject Withdrawal
    const rejectWithdrawal = useCallback(async (withdrawalId: string, reason?: string) => {
        try {
            await affiliateAdminAPI.rejectWithdrawal(withdrawalId, reason);
            toast.success("Withdrawal rejected successfully");
            fetchWithdrawals();
            fetchDashboard();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to reject withdrawal");
        }
    }, [fetchWithdrawals, fetchDashboard]);

    // Complete Withdrawal
    const completeWithdrawal = useCallback(async (withdrawalId: string, transactionId?: string) => {
        try {
            await affiliateAdminAPI.completeWithdrawal(withdrawalId, transactionId);
            toast.success("Withdrawal completed successfully");
            fetchWithdrawals();
            fetchDashboard();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to complete withdrawal");
        }
    }, [fetchWithdrawals, fetchDashboard]);

    // Process Withdrawal
    const processWithdrawal = useCallback(async (withdrawalId: string) => {
        try {
            await affiliateAdminAPI.processWithdrawal(withdrawalId);
            toast.success("Withdrawal marked as processing");
            fetchWithdrawals();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to process withdrawal");
        }
    }, [fetchWithdrawals]);

    // Update Settings
    const updateSettings = useCallback(async (settingsData: any) => {
        try {
            await affiliateAdminAPI.updateSettings(settingsData);
            toast.success("Settings updated successfully");
            fetchSettings();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to update settings");
        }
    }, [fetchSettings]);

    // Initial load
    useEffect(() => {
        fetchDashboard();
        fetchAffiliates();
        fetchCommissions();
        fetchWithdrawals();
    }, [fetchDashboard, fetchAffiliates, fetchCommissions, fetchWithdrawals]);

    return {
        dashboardStats,
        affiliates,
        commissions,
        withdrawals,
        settings,
        auditLogs,
        auditStats,
        isLoading,
        isLoadingAffiliates,
        isLoadingCommissions,
        isLoadingWithdrawals,
        isLoadingSettings,
        isLoadingAuditLogs,
        pagination,
        fetchDashboard,
        fetchAffiliates,
        fetchCommissions,
        fetchWithdrawals,
        fetchSettings,
        fetchAuditLogs,
        fetchAuditStats,
        approveAffiliate,
        suspendAffiliate,
        banAffiliate,
        updateTier,
        updateRate,
        approveCommission,
        rejectCommission,
        approveWithdrawal,
        rejectWithdrawal,
        completeWithdrawal,
        processWithdrawal,
        updateSettings,
    };
}
