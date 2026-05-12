"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Info, AlertTriangle, XCircle, CheckCircle2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/cn";
import { getNotifications, markAsRead, markAllAsRead } from "@/features/notifications/actions";
import { acknowledgeDebateFeedbackAction } from "@/features/debate/actions";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  evaluationId?: string | null;
  createdAt: Date | string;
  evaluation?: {
    acknowledgedAt?: Date | string | null;
  } | null;
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    const data = await getNotifications();
    setNotifications(data);
    setUnreadCount(data.filter((n: NotificationItem) => !n.isRead).length);
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    fetchNotifications();
  };

  const handleAcknowledge = async (notification: NotificationItem) => {
    if (!notification.evaluationId) return;

    const formData = new FormData();
    formData.append("evaluationId", notification.evaluationId);
    formData.append("notificationId", notification.id);
    await acknowledgeDebateFeedbackAction(formData);
    fetchNotifications();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 text-slate-500 backdrop-blur-md transition-all hover:bg-slate-50",
          open && "border-navy text-navy"
        )}
        aria-label="Notificações"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-3 z-40 w-80 sm:w-96 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/50 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex items-center justify-between">
               <div>
                  <h3 className="text-lg font-black text-slate-900">Comunicados</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Atualizações e Alertas</p>
               </div>
               {unreadCount > 0 && (
                 <button 
                   onClick={handleMarkAllRead}
                   className="text-[10px] font-black text-navy uppercase underline hover:text-blue-600 transition-colors"
                 >
                   Ler todas
                 </button>
               )}
            </div>

            <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
               {notifications.length === 0 ? (
                 <div className="py-12 text-center">
                    <MessageSquare size={32} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-sm font-bold text-slate-400 italic">Nenhum comunicado no momento.</p>
                 </div>
               ) : (
                 notifications.map((notif) => {
                  const needsFeedbackAck = notif.type === "DEBATE_FEEDBACK" && notif.evaluationId && !notif.evaluation?.acknowledgedAt;
                  return (
                   <div 
                     key={notif.id} 
                     onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                     className={cn(
                       "group p-4 rounded-3xl border transition-all cursor-pointer relative overflow-hidden",
                       notif.isRead 
                        ? "bg-white border-slate-100" 
                        : "bg-navy/[0.02] border-navy/10 hover:border-navy/20"
                     )}
                   >
                     <div className="flex gap-4">
                        <div className={cn(
                          "h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center",
                          notif.type === "DANGER" ? "bg-rose-50 text-rose-500" :
                          notif.type === "WARNING" ? "bg-amber-50 text-amber-600" :
                          notif.type === "SUCCESS" ? "bg-emerald-50 text-emerald-500" :
                          "bg-blue-50 text-blue-500"
                        )}>
                           {notif.type === "DANGER" ? <XCircle size={18} /> :
                            notif.type === "WARNING" ? <AlertTriangle size={18} /> :
                            notif.type === "SUCCESS" ? <CheckCircle2 size={18} /> :
                            <Info size={18} />}
                        </div>
                        <div className="min-w-0 flex-1">
                           <div className="flex justify-between items-start">
                              <h4 className={cn("text-sm font-black truncate", notif.isRead ? "text-slate-700" : "text-slate-900")}>
                                 {notif.title}
                              </h4>
                              {!notif.isRead && <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0 mt-1" />}
                           </div>
                           <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-2">
                              {notif.message}
                           </p>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-3">
                              {new Date(notif.createdAt).toLocaleDateString("pt-PT")} às {new Date(notif.createdAt).toLocaleTimeString("pt-PT", { hour: '2-digit', minute: '2-digit' })}
                           </p>
                           {needsFeedbackAck ? (
                             <button
                               type="button"
                               onClick={(event) => {
                                 event.stopPropagation();
                                 handleAcknowledge(notif);
                               }}
                               className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-xl bg-crimson px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-rose-700"
                             >
                               <Check size={13} /> Certo, recebido
                             </button>
                           ) : notif.type === "DEBATE_FEEDBACK" ? (
                             <p className="mt-3 inline-flex rounded-xl bg-emerald-50 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-emerald-600">
                               Feedback confirmado
                             </p>
                           ) : null}
                        </div>
                     </div>
                   </div>
                 );
                })
               )}
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
               <button className="text-[10px] font-black uppercase text-slate-400 tracking-widest hover:text-slate-600 transition-colors">
                  Ver histórico completo
               </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
