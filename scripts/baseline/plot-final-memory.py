from pathlib import Path
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
project=Path(__file__).resolve().parents[2];summary=json.loads((project/'evidence/t10/summary.json').read_text())
cases=['unchanged','body-1','body-10','body-100','navigation','metadata','shared-shell','island','collection','docs-sync','route-add','route-rename','route-delete']
labels=['Unchanged production command','1 body','10 bodies','100 bodies','Navigation','Title metadata','Shared Footer','ThemeToggle component','Blog collection source','Docs sync input','Route add + navigation','Route rename + navigation','Route delete + navigation']
colors=['#49545f','#bd4f24','#147d80'];names=['upstream','tanstack','tanstack-agent'];legend=['Upstream TanStack Start','Nift authored-source','Nift rendered-source']
for metric,title,filename in [('maximum_individual_process_rss_kib','Maximum individual process/phase RSS','incremental-process-rss.png'),('sampled_descendant_tree_peak_rss_kib','Sampled descendant-tree peak RSS (50ms)','incremental-tree-rss.png')]:
 fig,ax=plt.subplots(figsize=(11,10));y=np.arange(len(cases))
 for j,name in enumerate(names):
  values=[next(r for r in summary if r['implementation']==name and r['workload']==case)[metric] for case in cases]
  median=np.array([v['median']/1024 for v in values]);low=np.array([v['min']/1024 for v in values]);high=np.array([v['max']/1024 for v in values])
  ax.errorbar(median,y+(j-1)*.22,xerr=[median-low,high-median],fmt='o',markersize=5,color=colors[j],capsize=3,label=legend[j],linewidth=1.3)
 ax.set_yticks(y,labels);ax.invert_yaxis();ax.set_xscale('log');ax.set_xlabel('MiB · logarithmic scale · median and min–max of five samples');ax.set_xticks([400,600,1000,2000,3000,4000,6000]);ax.xaxis.set_major_formatter(matplotlib.ticker.StrMethodFormatter('{x:,.0f}'));ax.xaxis.set_minor_formatter(matplotlib.ticker.NullFormatter());ax.grid(axis='x',which='both',alpha=.2);ax.spines[['top','right']].set_visible(False)
 fig.suptitle(title,fontsize=17,fontweight='bold',y=.97);fig.text(.5,.925,'Same complete-command memory windows as the timing campaign',ha='center',fontsize=10)
 fig.legend(loc='lower center',bbox_to_anchor=(.63,.09),ncol=1,frameon=False)
 fig.text(.04,.025,'Upstream docs/config/meta/sync/lifecycle: native local R2 refresh; other rows: production build.\nNift: complete publisher with retained Vite when required. No live edge/network or end-user SSR.\nIndividual process/phase and sampled tree are separate metrics; sampled peaks can miss brief spikes.',fontsize=9)
 fig.subplots_adjust(left=.28,right=.96,top=.88,bottom=.21)
 out=project/'evidence/t10';out.mkdir(parents=True,exist_ok=True);fig.savefig(out/filename,dpi=170,facecolor='white')
 plt.close(fig)
