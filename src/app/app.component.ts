import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { BrowserService } from './browser-service';
import { FoundryPF2GithubService } from './foundry-pf2-github.service';
import { FoundryToRoll20Service } from './foundry-to-roll20.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  nodes!: TreeNode[];
  loading!: boolean;
  selectedNode!: TreeNode;
  previousSelectedNode!: TreeNode;

  constructor(
    private foundryPF2GithubService: FoundryPF2GithubService,
    private foundryToRoll20Service: FoundryToRoll20Service,
    private browserService: BrowserService
  ) {

  }

  ngOnInit(): void {
    this.loading = true;
    this.foundryPF2GithubService.getSystemPacks().subscribe(packs => {
      this.nodes = packs
        .filter((pack: any) => pack.type == "Actor")
        .map((pack: any) => ({
          label: pack.label,
          data: pack,
          expandedIcon: "pi pi-folder-open",
          collapsedIcon: "pi pi-folder",
          leaf: false,
          selectable: false
        }));
      this.loading = false;
    });
  }

  nodeExpand(event: any) {
    if (event.node) {
      const node: TreeNode = event.node;
      this.foundryPF2GithubService.listPackItems(node.data.name).subscribe(
        items => node.children = items.map(
          item => ({
            label: this.jsonFileNameToCreatureName(item.name),
            data: item,
            leaf: true,
            selectable: true,
            type: 'selectableNode'
          })
        )
      );
    }
  }

  nodeSelect(event: any) {
    console.log('select', event, this.selectedNode);
    if (this.previousSelectedNode) {
      this.previousSelectedNode.data.selected = false;
    }
    event.node.data.selected = true;
    this.previousSelectedNode = event.node;
  }

  nodeUnselect(event: any) {
    event.node.data.selected = false;
  }

  import(node: TreeNode) {
    this.foundryPF2GithubService.getCreatureJson(node.data.path).subscribe((creature: any) => {
      console.log('From github: ', creature);
      const roll20Sheet = this.foundryToRoll20Service.convertFoundrySheetToRoll20(creature);
      console.log('Roll20 Sheet', roll20Sheet);
      this.browserService.sendMessage('importCreature', roll20Sheet);
    });
  }

  private jsonFileNameToCreatureName(jsonFileName: string) {
    return jsonFileName
      .replaceAll(".json", "")
      .split("-")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
}
